// ==================== Core Types ====================

export type ProjectPhase =
  | "intake"
  | "planning"
  | "coding"
  | "debugging"
  | "deployment"
  | "completed"
  | "paused";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "awaiting_human"
  | "completed"
  | "failed"
  | "skipped";

export type TaskComplexity = "trivial" | "simple" | "moderate" | "complex" | "very_complex";

export type FileType =
  | "typescript"
  | "javascript"
  | "json"
  | "css"
  | "html"
  | "markdown"
  | "yaml"
  | "dockerfile"
  | "shell"
  | "python"
  | "sql"
  | "other";

export interface Project {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  spec: TechnicalSpec | null;
  plan: ProjectPlan | null;
  files: ProjectFile[];
  sessions: Session[];
  createdAt: string;
  updatedAt: string;
  totalTokensUsed: number;
  estimatedCost: number;
}

export interface TechnicalSpec {
  overview: string;
  architecture: string;
  techStack: string[];
  features: FeatureSpec[];
  dataModels: DataModel[];
  apiEndpoints: ApiEndpoint[];
  deploymentStrategy: string;
  estimatedComplexity: TaskComplexity;
}

export interface FeatureSpec {
  id: string;
  name: string;
  description: string;
  priority: "must_have" | "should_have" | "nice_to_have";
  acceptanceCriteria: string[];
}

export interface DataModel {
  name: string;
  fields: { name: string; type: string; required: boolean; description: string }[];
  relationships: string[];
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

export interface ProjectPlan {
  tasks: ProjectTask[];
  milestones: Milestone[];
  estimatedHours: number;
  estimatedTokens: number;
  estimatedCost: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  complexity: TaskComplexity;
  estimatedMinutes: number;
  dependencies: string[];
  files: string[];
  phase: ProjectPhase;
  humanInterventionRequired: boolean;
  humanInterventionReason?: string;
  output?: string;
  error?: string;
  tokensUsed: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  completed: boolean;
}

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: FileType;
  lastModified: string;
  version: number;
  explanation?: string;
}

export interface Session {
  id: string;
  projectId: string;
  startedAt: string;
  endedAt?: string;
  phase: ProjectPhase;
  tasksCompleted: number;
  tokensUsed: number;
  status: "active" | "paused" | "completed";
}

export interface TerminalLine {
  id: string;
  type: "command" | "output" | "error" | "info" | "success" | "warning";
  content: string;
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  role: "agent" | "system" | "human";
  content: string;
  timestamp: string;
  phase: ProjectPhase;
  metadata?: {
    tokensUsed?: number;
    filesModified?: string[];
    taskId?: string;
  };
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  totalCost: number;
  breakdown: {
    phase: ProjectPhase;
    tokens: number;
    cost: number;
  }[];
}

export interface HumanIntervention {
  id: string;
  taskId: string;
  question: string;
  options?: string[];
  response?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DeploymentConfig {
  dockerfile: string;
  dockerCompose: string;
  envTemplate: string;
  deploymentNotes: string;
  platform: "docker" | "vercel" | "railway" | "fly" | "aws";
}
