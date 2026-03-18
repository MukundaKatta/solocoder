import { create } from "zustand";
import {
  Project,
  ProjectPhase,
  TechnicalSpec,
  ProjectPlan,
  ProjectFile,
  ProjectTask,
  AgentMessage,
  TerminalLine,
  Session,
  HumanIntervention,
  DeploymentConfig,
  CostEstimate,
  TaskStatus,
} from "@/types";
import { generateId } from "@/lib/utils";
import { aiEngine, COST_PER_INPUT_TOKEN, COST_PER_OUTPUT_TOKEN } from "@/lib/ai-engine";

interface ProjectStore {
  // State
  project: Project | null;
  currentPhase: ProjectPhase;
  isRunning: boolean;
  isPaused: boolean;
  currentTaskId: string | null;
  terminalLines: TerminalLine[];
  agentMessages: AgentMessage[];
  activeSession: Session | null;
  interventions: HumanIntervention[];
  pendingIntervention: HumanIntervention | null;
  deploymentConfig: DeploymentConfig | null;
  costEstimate: CostEstimate;
  activeFileId: string | null;
  previewUrl: string | null;
  editorSidebarOpen: boolean;

  // Actions
  createProject: (name: string, description: string) => void;
  setPhase: (phase: ProjectPhase) => void;
  startIntake: (description: string) => Promise<void>;
  approveSpec: () => void;
  startPlanning: () => Promise<void>;
  approvePlan: () => void;
  startCoding: () => Promise<void>;
  startDebugging: () => Promise<void>;
  startDeployment: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  stopAgent: () => void;
  resolveIntervention: (interventionId: string, response: string) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFile: (fileId: string, content: string) => void;
  addTerminalLine: (line: TerminalLine) => void;
  addAgentMessage: (msg: AgentMessage) => void;
  clearTerminal: () => void;
  setPreviewUrl: (url: string | null) => void;
  toggleEditorSidebar: () => void;
  loadProject: (project: Project) => void;
  resetStore: () => void;
}

const initialCostEstimate: CostEstimate = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  costPerInputToken: COST_PER_INPUT_TOKEN,
  costPerOutputToken: COST_PER_OUTPUT_TOKEN,
  totalCost: 0,
  breakdown: [],
};

export const useProjectStore = create<ProjectStore>((set, get) => {
  // Setup AI engine callbacks
  const setupCallbacks = () => {
    aiEngine.setCallbacks({
      onTerminalLine: (line) => {
        set((state) => ({ terminalLines: [...state.terminalLines, line] }));
      },
      onAgentMessage: (msg) => {
        set((state) => ({ agentMessages: [...state.agentMessages, msg] }));
      },
      onFileUpdate: (file) => {
        const project = get().project;
        if (!project) return;
        const existingIndex = project.files.findIndex((f) => f.path === file.path);
        const newFiles =
          existingIndex >= 0
            ? project.files.map((f, i) => (i === existingIndex ? { ...file, version: f.version + 1 } : f))
            : [...project.files, file];
        set({ project: { ...project, files: newFiles } });
      },
    });
  };

  const updateCost = (inputTokens: number, outputTokens: number, phase: ProjectPhase) => {
    set((state) => {
      const newCost = { ...state.costEstimate };
      newCost.inputTokens += inputTokens;
      newCost.outputTokens += outputTokens;
      newCost.totalTokens = newCost.inputTokens + newCost.outputTokens;
      newCost.totalCost =
        newCost.inputTokens * COST_PER_INPUT_TOKEN +
        newCost.outputTokens * COST_PER_OUTPUT_TOKEN;

      const existingBreakdown = newCost.breakdown.find((b) => b.phase === phase);
      if (existingBreakdown) {
        existingBreakdown.tokens += inputTokens + outputTokens;
        existingBreakdown.cost +=
          inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN;
      } else {
        newCost.breakdown.push({
          phase,
          tokens: inputTokens + outputTokens,
          cost: inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN,
        });
      }

      return { costEstimate: newCost };
    });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, extra?: Partial<ProjectTask>) => {
    const project = get().project;
    if (!project?.plan) return;
    const newTasks = project.plan.tasks.map((t) =>
      t.id === taskId ? { ...t, status, ...extra } : t
    );
    set({
      project: {
        ...project,
        plan: { ...project.plan, tasks: newTasks },
      },
    });
  };

  return {
    project: null,
    currentPhase: "intake",
    isRunning: false,
    isPaused: false,
    currentTaskId: null,
    terminalLines: [],
    agentMessages: [],
    activeSession: null,
    interventions: [],
    pendingIntervention: null,
    deploymentConfig: null,
    costEstimate: initialCostEstimate,
    activeFileId: null,
    previewUrl: null,
    editorSidebarOpen: true,

    createProject: (name, description) => {
      const project: Project = {
        id: generateId(),
        name,
        description,
        phase: "intake",
        spec: null,
        plan: null,
        files: [],
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTokensUsed: 0,
        estimatedCost: 0,
      };
      set({ project, currentPhase: "intake" });
    },

    setPhase: (phase) => {
      set({ currentPhase: phase });
      const project = get().project;
      if (project) {
        set({ project: { ...project, phase, updatedAt: new Date().toISOString() } });
      }
    },

    startIntake: async (description) => {
      setupCallbacks();
      set({ isRunning: true });

      const session: Session = {
        id: generateId(),
        projectId: get().project?.id || "",
        startedAt: new Date().toISOString(),
        phase: "intake",
        tasksCompleted: 0,
        tokensUsed: 0,
        status: "active",
      };
      set({ activeSession: session });

      try {
        const result = await aiEngine.generateSpec(description);
        const project = get().project;
        if (project) {
          set({
            project: {
              ...project,
              spec: result.spec,
              totalTokensUsed: project.totalTokensUsed + result.tokensUsed,
              updatedAt: new Date().toISOString(),
            },
            isRunning: false,
          });
          updateCost(result.tokensUsed * 0.4, result.tokensUsed * 0.6, "intake");
        }
      } catch {
        set({ isRunning: false });
      }
    },

    approveSpec: () => {
      get().setPhase("planning");
    },

    startPlanning: async () => {
      const project = get().project;
      if (!project?.spec) return;

      setupCallbacks();
      set({ isRunning: true });

      try {
        const result = await aiEngine.generatePlan(project.spec);
        set({
          project: {
            ...project,
            plan: result.plan,
            totalTokensUsed: project.totalTokensUsed + result.tokensUsed,
            estimatedCost: result.plan.estimatedCost,
            updatedAt: new Date().toISOString(),
          },
          isRunning: false,
        });
        updateCost(result.tokensUsed * 0.4, result.tokensUsed * 0.6, "planning");
      } catch {
        set({ isRunning: false });
      }
    },

    approvePlan: () => {
      get().setPhase("coding");
    },

    startCoding: async () => {
      const project = get().project;
      if (!project?.plan || !project.spec) return;

      setupCallbacks();
      set({ isRunning: true, currentPhase: "coding" });

      const codingTasks = project.plan.tasks.filter((t) => t.phase === "coding" && t.status === "pending");

      for (const task of codingTasks) {
        if (get().isPaused) break;

        // Check for human intervention
        if (task.humanInterventionRequired) {
          const intervention: HumanIntervention = {
            id: generateId(),
            taskId: task.id,
            question: task.humanInterventionReason || `Approve task: ${task.title}?`,
            options: ["Approve and continue", "Skip this task", "Modify and continue"],
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            pendingIntervention: intervention,
            interventions: [...state.interventions, intervention],
            isRunning: false,
          }));

          // Wait for human response
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              const pending = get().pendingIntervention;
              if (!pending || pending.response) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 500);
          });

          const resolvedIntervention = get().interventions.find((i) => i.id === intervention.id);
          if (resolvedIntervention?.response === "Skip this task") {
            updateTaskStatus(task.id, "skipped");
            continue;
          }

          set({ isRunning: true, pendingIntervention: null });
        }

        set({ currentTaskId: task.id });
        updateTaskStatus(task.id, "in_progress", { startedAt: new Date().toISOString() });

        try {
          const result = await aiEngine.executeTask(task, project.spec, project.files);

          updateTaskStatus(task.id, "completed", {
            completedAt: new Date().toISOString(),
            output: result.output,
            tokensUsed: result.tokensUsed,
          });

          updateCost(result.tokensUsed * 0.4, result.tokensUsed * 0.6, "coding");
        } catch {
          updateTaskStatus(task.id, "failed");
          break;
        }
      }

      set({ isRunning: false, currentTaskId: null });
    },

    startDebugging: async () => {
      const project = get().project;
      if (!project?.spec) return;

      setupCallbacks();
      set({ isRunning: true, currentPhase: "debugging" });
      get().setPhase("debugging");

      try {
        const result = await aiEngine.runDebugLoop(project.files, project.spec);
        updateCost(result.tokensUsed * 0.4, result.tokensUsed * 0.6, "debugging");
        set({ isRunning: false });
      } catch {
        set({ isRunning: false });
      }
    },

    startDeployment: async () => {
      const project = get().project;
      if (!project?.spec) return;

      setupCallbacks();
      set({ isRunning: true, currentPhase: "deployment" });
      get().setPhase("deployment");

      try {
        const result = await aiEngine.generateDeployment(project.spec, project.files);
        set({
          deploymentConfig: result.config,
          isRunning: false,
        });
        updateCost(result.tokensUsed * 0.4, result.tokensUsed * 0.6, "deployment");
      } catch {
        set({ isRunning: false });
      }
    },

    pauseSession: () => {
      set({ isPaused: true, isRunning: false });
      aiEngine.abort();
      const session = get().activeSession;
      if (session) {
        set({ activeSession: { ...session, status: "paused" } });
      }
    },

    resumeSession: () => {
      set({ isPaused: false });
      const phase = get().currentPhase;
      if (phase === "coding") get().startCoding();
    },

    stopAgent: () => {
      aiEngine.abort();
      set({ isRunning: false, isPaused: false, currentTaskId: null });
    },

    resolveIntervention: (interventionId, response) => {
      set((state) => ({
        interventions: state.interventions.map((i) =>
          i.id === interventionId
            ? { ...i, response, resolvedAt: new Date().toISOString() }
            : i
        ),
        pendingIntervention:
          state.pendingIntervention?.id === interventionId
            ? { ...state.pendingIntervention, response, resolvedAt: new Date().toISOString() }
            : state.pendingIntervention,
      }));
    },

    setActiveFile: (fileId) => set({ activeFileId: fileId }),

    updateFile: (fileId, content) => {
      const project = get().project;
      if (!project) return;
      set({
        project: {
          ...project,
          files: project.files.map((f) =>
            f.id === fileId
              ? { ...f, content, lastModified: new Date().toISOString(), version: f.version + 1 }
              : f
          ),
        },
      });
    },

    addTerminalLine: (line) => {
      set((state) => ({ terminalLines: [...state.terminalLines, line] }));
    },

    addAgentMessage: (msg) => {
      set((state) => ({ agentMessages: [...state.agentMessages, msg] }));
    },

    clearTerminal: () => set({ terminalLines: [] }),

    setPreviewUrl: (url) => set({ previewUrl: url }),

    toggleEditorSidebar: () =>
      set((state) => ({ editorSidebarOpen: !state.editorSidebarOpen })),

    loadProject: (project) => {
      set({
        project,
        currentPhase: project.phase,
        terminalLines: [],
        agentMessages: [],
      });
    },

    resetStore: () => {
      set({
        project: null,
        currentPhase: "intake",
        isRunning: false,
        isPaused: false,
        currentTaskId: null,
        terminalLines: [],
        agentMessages: [],
        activeSession: null,
        interventions: [],
        pendingIntervention: null,
        deploymentConfig: null,
        costEstimate: initialCostEstimate,
        activeFileId: null,
        previewUrl: null,
        editorSidebarOpen: true,
      });
    },
  };
});
