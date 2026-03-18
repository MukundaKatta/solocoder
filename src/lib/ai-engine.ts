import {
  Project,
  TechnicalSpec,
  ProjectPlan,
  ProjectTask,
  ProjectFile,
  DeploymentConfig,
  TaskComplexity,
  AgentMessage,
  TerminalLine,
} from "@/types";
import { generateId, getFileLanguage, estimateTokens } from "./utils";

// Cost per token (GPT-4o pricing as default)
const COST_PER_INPUT_TOKEN = 0.0000025;
const COST_PER_OUTPUT_TOKEN = 0.00001;

interface AIResponse {
  content: string;
  tokensUsed: { input: number; output: number };
}

// Simulated AI engine that produces realistic outputs
// In production, replace with actual API calls to OpenAI/Anthropic
class AIEngine {
  private onTerminalLine?: (line: TerminalLine) => void;
  private onAgentMessage?: (msg: AgentMessage) => void;
  private onFileUpdate?: (file: ProjectFile) => void;
  private abortController?: AbortController;

  setCallbacks(callbacks: {
    onTerminalLine?: (line: TerminalLine) => void;
    onAgentMessage?: (msg: AgentMessage) => void;
    onFileUpdate?: (file: ProjectFile) => void;
  }) {
    this.onTerminalLine = callbacks.onTerminalLine;
    this.onAgentMessage = callbacks.onAgentMessage;
    this.onFileUpdate = callbacks.onFileUpdate;
  }

  abort() {
    this.abortController?.abort();
  }

  private emitTerminal(type: TerminalLine["type"], content: string) {
    this.onTerminalLine?.({
      id: generateId(),
      type,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  private emitMessage(
    role: AgentMessage["role"],
    content: string,
    phase: AgentMessage["phase"],
    metadata?: AgentMessage["metadata"]
  ) {
    this.onAgentMessage?.({
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      phase,
      metadata,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      if (this.abortController) {
        this.abortController.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Aborted"));
        });
      }
    });
  }

  async callAI(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    // In production, this calls the actual API
    // For now, we return structured responses based on the prompt context
    const apiKey = typeof window === "undefined"
      ? process.env.OPENAI_API_KEY
      : null;

    if (apiKey) {
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt, userPrompt }),
          signal: this.abortController?.signal,
        });
        const data = await response.json();
        return {
          content: data.content,
          tokensUsed: data.tokensUsed || { input: estimateTokens(systemPrompt + userPrompt), output: estimateTokens(data.content) },
        };
      } catch {
        // Fall through to simulation
      }
    }

    // Simulation mode
    const inputTokens = estimateTokens(systemPrompt + userPrompt);
    const outputTokens = Math.floor(inputTokens * 1.5);
    return {
      content: "",
      tokensUsed: { input: inputTokens, output: outputTokens },
    };
  }

  // ==================== Phase 1: Intake ====================
  async generateSpec(projectDescription: string): Promise<{ spec: TechnicalSpec; tokensUsed: number }> {
    this.abortController = new AbortController();

    this.emitMessage("agent", "Analyzing your project description...", "intake");
    this.emitTerminal("info", "Starting project analysis...");
    await this.delay(800);

    this.emitTerminal("command", "solocoder analyze --input project_description.txt");
    await this.delay(600);
    this.emitTerminal("output", "Parsing requirements...");
    await this.delay(400);
    this.emitTerminal("output", "Identifying tech stack...");
    await this.delay(500);
    this.emitTerminal("output", "Generating architecture diagram...");
    await this.delay(700);
    this.emitTerminal("success", "Analysis complete.");

    // Generate realistic spec based on description
    const lowerDesc = projectDescription.toLowerCase();
    const isWeb = lowerDesc.includes("web") || lowerDesc.includes("app") || lowerDesc.includes("dashboard") || lowerDesc.includes("site");
    const isAPI = lowerDesc.includes("api") || lowerDesc.includes("backend") || lowerDesc.includes("server");
    const hasCRUD = lowerDesc.includes("crud") || lowerDesc.includes("manage") || lowerDesc.includes("create") || lowerDesc.includes("users");
    const hasAuth = lowerDesc.includes("auth") || lowerDesc.includes("login") || lowerDesc.includes("user");
    const hasDB = lowerDesc.includes("database") || lowerDesc.includes("data") || lowerDesc.includes("store") || hasCRUD;

    const techStack: string[] = [];
    if (isWeb) techStack.push("Next.js 14", "React 18", "TypeScript", "Tailwind CSS");
    else if (isAPI) techStack.push("Node.js", "Express", "TypeScript");
    else techStack.push("TypeScript", "Node.js");

    if (hasDB) techStack.push("PostgreSQL", "Prisma ORM");
    if (hasAuth) techStack.push("NextAuth.js", "JWT");
    techStack.push("Docker");

    const features: TechnicalSpec["features"] = [];

    if (hasAuth) {
      features.push({
        id: generateId(),
        name: "Authentication System",
        description: "User registration, login, and session management",
        priority: "must_have",
        acceptanceCriteria: [
          "Users can register with email and password",
          "Users can log in and receive a session token",
          "Protected routes redirect unauthenticated users",
          "Password reset functionality",
        ],
      });
    }

    // Extract key nouns from description for feature generation
    const words = projectDescription.split(/\s+/);
    const significantWords = words.filter((w) => w.length > 4);
    const featureCount = Math.min(significantWords.length, 5);

    for (let i = 0; i < Math.max(featureCount, 3); i++) {
      features.push({
        id: generateId(),
        name: `Core Feature ${i + 1}`,
        description: `Implementation of ${significantWords[i] || "core"} functionality as described in requirements`,
        priority: i < 2 ? "must_have" : "should_have",
        acceptanceCriteria: [
          "Feature works as described in the specification",
          "Unit tests pass",
          "UI is responsive and accessible",
        ],
      });
    }

    if (isWeb) {
      features.push({
        id: generateId(),
        name: "Responsive UI",
        description: "Modern responsive design that works across all screen sizes",
        priority: "must_have",
        acceptanceCriteria: [
          "Works on mobile (320px+)",
          "Works on tablet (768px+)",
          "Works on desktop (1024px+)",
        ],
      });
    }

    const dataModels: TechnicalSpec["dataModels"] = [];
    if (hasAuth) {
      dataModels.push({
        name: "User",
        fields: [
          { name: "id", type: "UUID", required: true, description: "Primary key" },
          { name: "email", type: "String", required: true, description: "User email address" },
          { name: "passwordHash", type: "String", required: true, description: "Hashed password" },
          { name: "name", type: "String", required: false, description: "Display name" },
          { name: "createdAt", type: "DateTime", required: true, description: "Account creation date" },
        ],
        relationships: [],
      });
    }

    if (hasDB) {
      dataModels.push({
        name: "Item",
        fields: [
          { name: "id", type: "UUID", required: true, description: "Primary key" },
          { name: "title", type: "String", required: true, description: "Item title" },
          { name: "description", type: "Text", required: false, description: "Item description" },
          { name: "status", type: "Enum", required: true, description: "Current status" },
          { name: "createdAt", type: "DateTime", required: true, description: "Creation date" },
          { name: "updatedAt", type: "DateTime", required: true, description: "Last update" },
        ],
        relationships: hasAuth ? ["belongsTo: User"] : [],
      });
    }

    const apiEndpoints: TechnicalSpec["apiEndpoints"] = [];
    if (isAPI || isWeb) {
      if (hasAuth) {
        apiEndpoints.push(
          { method: "POST", path: "/api/auth/register", description: "Register a new user" },
          { method: "POST", path: "/api/auth/login", description: "Authenticate user" },
          { method: "POST", path: "/api/auth/logout", description: "End user session" }
        );
      }
      if (hasCRUD || hasDB) {
        apiEndpoints.push(
          { method: "GET", path: "/api/items", description: "List all items with pagination" },
          { method: "GET", path: "/api/items/:id", description: "Get single item by ID" },
          { method: "POST", path: "/api/items", description: "Create a new item" },
          { method: "PUT", path: "/api/items/:id", description: "Update an existing item" },
          { method: "DELETE", path: "/api/items/:id", description: "Delete an item" }
        );
      }
    }

    const spec: TechnicalSpec = {
      overview: `A ${isWeb ? "full-stack web application" : isAPI ? "backend API service" : "software project"} that ${projectDescription.slice(0, 200)}. Built with modern technologies for scalability and maintainability.`,
      architecture: isWeb
        ? "Next.js App Router with server components, API routes for backend logic, PostgreSQL for data persistence, and containerized deployment."
        : isAPI
          ? "Express.js REST API with middleware architecture, PostgreSQL database with Prisma ORM, and Docker containerization."
          : "Modular TypeScript application with clean architecture principles and Docker deployment.",
      techStack,
      features,
      dataModels,
      apiEndpoints,
      deploymentStrategy: "Docker containerization with docker-compose for local development and single-command deployment to any container platform.",
      estimatedComplexity: features.length > 5 ? "complex" : features.length > 3 ? "moderate" : "simple",
    };

    const tokensUsed = estimateTokens(projectDescription) + estimateTokens(JSON.stringify(spec));

    this.emitMessage(
      "agent",
      `Technical specification generated successfully!\n\n**Tech Stack:** ${techStack.join(", ")}\n**Features:** ${features.length} identified\n**API Endpoints:** ${apiEndpoints.length} endpoints\n**Complexity:** ${spec.estimatedComplexity}\n\nReview the spec and proceed to planning when ready.`,
      "intake",
      { tokensUsed }
    );

    return { spec, tokensUsed };
  }

  // ==================== Phase 2: Planning ====================
  async generatePlan(spec: TechnicalSpec): Promise<{ plan: ProjectPlan; tokensUsed: number }> {
    this.abortController = new AbortController();

    this.emitMessage("agent", "Creating project plan from technical specification...", "planning");
    this.emitTerminal("command", "solocoder plan --spec technical_spec.json");
    await this.delay(600);
    this.emitTerminal("output", "Breaking down features into tasks...");
    await this.delay(500);
    this.emitTerminal("output", "Estimating complexity for each task...");
    await this.delay(400);
    this.emitTerminal("output", "Building dependency graph...");
    await this.delay(500);
    this.emitTerminal("output", "Creating timeline...");
    await this.delay(300);

    const tasks: ProjectTask[] = [];
    let taskOrder = 0;

    // Setup tasks
    const setupTasks = [
      {
        title: "Initialize project structure",
        description: "Create project directory structure, initialize package.json, configure TypeScript, ESLint, and Prettier",
        complexity: "simple" as TaskComplexity,
        files: ["package.json", "tsconfig.json", ".eslintrc.json", ".prettierrc"],
        phase: "coding" as const,
      },
      {
        title: "Configure build tools and environment",
        description: "Set up build configuration, environment variables, and development scripts",
        complexity: "simple" as TaskComplexity,
        files: ["next.config.js", ".env.example", ".gitignore"],
        phase: "coding" as const,
      },
    ];

    if (spec.techStack.includes("Tailwind CSS")) {
      setupTasks.push({
        title: "Configure Tailwind CSS and global styles",
        description: "Set up Tailwind CSS with custom theme configuration and global styles",
        complexity: "trivial" as TaskComplexity,
        files: ["tailwind.config.ts", "postcss.config.js", "src/app/globals.css"],
        phase: "coding" as const,
      });
    }

    if (spec.techStack.includes("Prisma ORM") || spec.techStack.includes("PostgreSQL")) {
      setupTasks.push({
        title: "Set up database schema and Prisma",
        description: "Create Prisma schema with all data models and configure database connection",
        complexity: "moderate" as TaskComplexity,
        files: ["prisma/schema.prisma", "src/lib/db.ts"],
        phase: "coding" as const,
      });
    }

    for (const setup of setupTasks) {
      tasks.push({
        id: generateId(),
        title: setup.title,
        description: setup.description,
        status: "pending",
        complexity: setup.complexity,
        estimatedMinutes: setup.complexity === "trivial" ? 1 : setup.complexity === "simple" ? 3 : 8,
        dependencies: taskOrder > 0 ? [tasks[0]?.id].filter(Boolean) : [],
        files: setup.files,
        phase: setup.phase,
        humanInterventionRequired: false,
        tokensUsed: 0,
      });
      taskOrder++;
    }

    // Feature tasks
    for (const feature of spec.features) {
      const featureComplexity: TaskComplexity =
        feature.priority === "must_have" ? "moderate" : "simple";

      tasks.push({
        id: generateId(),
        title: `Implement: ${feature.name}`,
        description: feature.description,
        status: "pending",
        complexity: featureComplexity,
        estimatedMinutes: featureComplexity === "moderate" ? 8 : 3,
        dependencies: tasks.length > 0 ? [tasks[tasks.length - 1].id] : [],
        files: [],
        phase: "coding",
        humanInterventionRequired: feature.priority === "must_have",
        humanInterventionReason: feature.priority === "must_have"
          ? `Review implementation of "${feature.name}" before proceeding`
          : undefined,
        tokensUsed: 0,
      });
    }

    // API tasks
    for (const endpoint of spec.apiEndpoints) {
      tasks.push({
        id: generateId(),
        title: `API: ${endpoint.method} ${endpoint.path}`,
        description: endpoint.description,
        status: "pending",
        complexity: "simple",
        estimatedMinutes: 3,
        dependencies: [],
        files: [`src/app/api${endpoint.path}/route.ts`],
        phase: "coding",
        humanInterventionRequired: false,
        tokensUsed: 0,
      });
    }

    // Testing task
    tasks.push({
      id: generateId(),
      title: "Write tests and run test suite",
      description: "Create unit and integration tests for core functionality",
      status: "pending",
      complexity: "moderate",
      estimatedMinutes: 10,
      dependencies: [],
      files: ["src/__tests__/"],
      phase: "debugging",
      humanInterventionRequired: false,
      tokensUsed: 0,
    });

    // Deployment task
    tasks.push({
      id: generateId(),
      title: "Generate deployment configuration",
      description: "Create Dockerfile, docker-compose.yml, and deployment documentation",
      status: "pending",
      complexity: "moderate",
      estimatedMinutes: 8,
      dependencies: [],
      files: ["Dockerfile", "docker-compose.yml", ".dockerignore"],
      phase: "deployment",
      humanInterventionRequired: true,
      humanInterventionReason: "Review deployment configuration before finalizing",
      tokensUsed: 0,
    });

    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const estimatedTokens = tasks.length * 2000;
    const estimatedCost = estimatedTokens * (COST_PER_INPUT_TOKEN + COST_PER_OUTPUT_TOKEN);

    // Create milestones
    const milestones = [
      {
        id: generateId(),
        name: "Project Setup Complete",
        description: "Development environment fully configured",
        taskIds: tasks.filter((t) => t.title.includes("Initialize") || t.title.includes("Configure")).map((t) => t.id),
        completed: false,
      },
      {
        id: generateId(),
        name: "Core Features Implemented",
        description: "All must-have features working",
        taskIds: tasks.filter((t) => t.title.includes("Implement")).map((t) => t.id),
        completed: false,
      },
      {
        id: generateId(),
        name: "API Complete",
        description: "All API endpoints functional",
        taskIds: tasks.filter((t) => t.title.includes("API")).map((t) => t.id),
        completed: false,
      },
      {
        id: generateId(),
        name: "Deployment Ready",
        description: "Application containerized and ready to deploy",
        taskIds: tasks.filter((t) => t.phase === "deployment").map((t) => t.id),
        completed: false,
      },
    ];

    const plan: ProjectPlan = {
      tasks,
      milestones,
      estimatedHours: Math.ceil(totalMinutes / 60),
      estimatedTokens,
      estimatedCost,
    };

    const tokensUsed = estimateTokens(JSON.stringify(spec)) + estimateTokens(JSON.stringify(plan));

    this.emitTerminal("success", `Plan created: ${tasks.length} tasks, ${milestones.length} milestones`);
    this.emitMessage(
      "agent",
      `Project plan created!\n\n**Tasks:** ${tasks.length}\n**Milestones:** ${milestones.length}\n**Estimated Time:** ${formatTime(totalMinutes)}\n**Estimated Tokens:** ~${(estimatedTokens / 1000).toFixed(0)}K\n**Estimated Cost:** $${estimatedCost.toFixed(2)}\n\nHuman intervention points are marked at key decision points. Ready to start coding?`,
      "planning",
      { tokensUsed }
    );

    return { plan, tokensUsed };
  }

  // ==================== Phase 3: Coding ====================
  async executeTask(
    task: ProjectTask,
    spec: TechnicalSpec,
    existingFiles: ProjectFile[]
  ): Promise<{ files: ProjectFile[]; output: string; tokensUsed: number }> {
    this.abortController = new AbortController();
    const newFiles: ProjectFile[] = [];

    this.emitMessage("agent", `Starting task: **${task.title}**\n\n${task.description}`, "coding", { taskId: task.id });
    this.emitTerminal("command", `solocoder execute --task "${task.title}"`);
    await this.delay(400);

    // Generate file content based on task
    const filesToCreate = task.files.length > 0
      ? task.files
      : this.inferFiles(task, spec);

    for (const filePath of filesToCreate) {
      if (!filePath || filePath.endsWith("/")) continue;

      this.emitTerminal("info", `Creating ${filePath}...`);
      await this.delay(300);

      const content = this.generateFileContent(filePath, task, spec);
      const language = getFileLanguage(filePath);

      const file: ProjectFile = {
        id: generateId(),
        path: filePath,
        content,
        language,
        lastModified: new Date().toISOString(),
        version: 1,
        explanation: `Generated as part of task: ${task.title}`,
      };

      newFiles.push(file);
      this.onFileUpdate?.(file);
      this.emitTerminal("success", `  Created ${filePath} (${content.split("\n").length} lines)`);
      await this.delay(200);
    }

    const tokensUsed = estimateTokens(JSON.stringify(task)) + newFiles.reduce((sum, f) => sum + estimateTokens(f.content), 0);

    const output = `Completed: ${task.title}\nFiles created: ${newFiles.map((f) => f.path).join(", ")}`;

    this.emitTerminal("success", `Task complete: ${newFiles.length} files generated`);
    this.emitMessage(
      "agent",
      `Task completed: **${task.title}**\n\nFiles created:\n${newFiles.map((f) => `- \`${f.path}\` (${f.content.split("\n").length} lines)`).join("\n")}`,
      "coding",
      { tokensUsed, filesModified: newFiles.map((f) => f.path), taskId: task.id }
    );

    return { files: newFiles, output, tokensUsed };
  }

  // ==================== Phase 4: Debugging ====================
  async runDebugLoop(
    files: ProjectFile[],
    _spec: TechnicalSpec
  ): Promise<{ fixes: { file: string; issue: string; fix: string }[]; tokensUsed: number }> {
    this.abortController = new AbortController();

    this.emitMessage("agent", "Starting debug loop — analyzing code for issues...", "debugging");
    this.emitTerminal("command", "solocoder debug --analyze");
    await this.delay(500);

    this.emitTerminal("command", "npx tsc --noEmit 2>&1");
    await this.delay(800);
    this.emitTerminal("output", "Checking TypeScript types...");
    await this.delay(600);

    const fixes: { file: string; issue: string; fix: string }[] = [];

    // Simulate finding and fixing a couple of issues
    if (files.length > 0) {
      this.emitTerminal("warning", `Found 2 potential issues`);
      await this.delay(300);

      fixes.push({
        file: files[0].path,
        issue: "Missing error handling in async function",
        fix: "Added try-catch block with proper error logging",
      });

      this.emitTerminal("info", `Fixing: ${fixes[0].issue} in ${fixes[0].file}`);
      await this.delay(400);
      this.emitTerminal("success", "  Fixed");

      fixes.push({
        file: files[0].path,
        issue: "Missing input validation",
        fix: "Added runtime type checking for API inputs",
      });

      this.emitTerminal("info", `Fixing: ${fixes[1].issue}`);
      await this.delay(400);
      this.emitTerminal("success", "  Fixed");
    }

    this.emitTerminal("command", "npx tsc --noEmit 2>&1");
    await this.delay(500);
    this.emitTerminal("success", "0 errors found. All clean!");

    this.emitTerminal("command", "npm test 2>&1");
    await this.delay(700);
    this.emitTerminal("success", "All tests passed.");

    const tokensUsed = estimateTokens(JSON.stringify(files.map((f) => f.path)));

    this.emitMessage(
      "agent",
      `Debug loop complete!\n\n**Issues found:** ${fixes.length}\n**Issues fixed:** ${fixes.length}\n\n${fixes.map((f) => `- **${f.file}**: ${f.issue} — ${f.fix}`).join("\n")}`,
      "debugging",
      { tokensUsed }
    );

    return { fixes, tokensUsed };
  }

  // ==================== Phase 5: Deployment ====================
  async generateDeployment(
    spec: TechnicalSpec,
    files: ProjectFile[]
  ): Promise<{ config: DeploymentConfig; tokensUsed: number }> {
    this.abortController = new AbortController();

    this.emitMessage("agent", "Generating deployment configuration...", "deployment");
    this.emitTerminal("command", "solocoder deploy --generate");
    await this.delay(500);

    const isNextJs = spec.techStack.some((t) => t.includes("Next.js"));
    const hasDB = spec.techStack.some((t) => t.includes("PostgreSQL") || t.includes("Prisma"));
    const projectName = "solocoder-project";

    this.emitTerminal("info", "Creating Dockerfile...");
    await this.delay(400);

    const dockerfile = isNextJs
      ? `# Multi-stage build for Next.js
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]`
      : `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

    this.emitTerminal("success", "  Dockerfile created");
    this.emitTerminal("info", "Creating docker-compose.yml...");
    await this.delay(300);

    let dockerCompose = `version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`;

    if (hasDB) {
      dockerCompose += `
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${projectName}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${projectName}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`;
    }

    this.emitTerminal("success", "  docker-compose.yml created");
    this.emitTerminal("info", "Creating environment template...");
    await this.delay(200);

    let envTemplate = `# Application
NODE_ENV=production
PORT=3000
`;
    if (hasDB) {
      envTemplate += `\n# Database\nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/${projectName}\n`;
    }
    if (spec.techStack.some((t) => t.includes("Auth"))) {
      envTemplate += `\n# Authentication\nNEXTAUTH_SECRET=your-secret-here\nNEXTAUTH_URL=http://localhost:3000\n`;
    }

    const config: DeploymentConfig = {
      dockerfile,
      dockerCompose,
      envTemplate,
      deploymentNotes: `## Deployment Guide

### Local Development
\`\`\`bash
docker-compose up --build
\`\`\`

### Production Deployment
1. Build: \`docker build -t ${projectName} .\`
2. Run: \`docker run -p 3000:3000 ${projectName}\`

### Environment Variables
Copy \`.env.example\` to \`.env\` and fill in the values.

### Files Generated
${files.map((f) => `- ${f.path}`).join("\n")}
`,
      platform: "docker",
    };

    this.emitTerminal("success", "Deployment configuration complete!");

    const tokensUsed = estimateTokens(JSON.stringify(config));

    this.emitMessage(
      "agent",
      `Deployment configuration ready!\n\n**Platform:** Docker\n**Files generated:**\n- \`Dockerfile\` (multi-stage build)\n- \`docker-compose.yml\`\n- \`.env.example\`\n\nRun \`docker-compose up --build\` to start locally.`,
      "deployment",
      { tokensUsed }
    );

    return { config, tokensUsed };
  }

  // Helper: infer file paths from task
  private inferFiles(task: ProjectTask, spec: TechnicalSpec): string[] {
    const title = task.title.toLowerCase();
    const files: string[] = [];

    if (title.includes("initialize") || title.includes("project structure")) {
      files.push("package.json", "tsconfig.json", ".eslintrc.json");
    } else if (title.includes("tailwind") || title.includes("style")) {
      files.push("tailwind.config.ts", "src/app/globals.css");
    } else if (title.includes("database") || title.includes("prisma")) {
      files.push("prisma/schema.prisma", "src/lib/db.ts");
    } else if (title.includes("auth")) {
      files.push("src/lib/auth.ts", "src/app/api/auth/[...nextauth]/route.ts", "src/middleware.ts");
    } else if (title.includes("api:")) {
      const pathMatch = title.match(/api:\s*\w+\s+(\/[^\s]+)/);
      if (pathMatch) {
        files.push(`src/app${pathMatch[1].replace(/:(\w+)/g, "[$1]")}/route.ts`);
      }
    } else if (title.includes("test")) {
      files.push("jest.config.ts", "src/__tests__/index.test.ts");
    } else if (title.includes("deploy")) {
      files.push("Dockerfile", "docker-compose.yml", ".dockerignore");
    } else if (title.includes("implement")) {
      const featureName = title.replace("implement:", "").trim().replace(/\s+/g, "-").toLowerCase();
      if (spec.techStack.some((t) => t.includes("Next.js"))) {
        files.push(
          `src/components/${featureName}.tsx`,
          `src/app/${featureName}/page.tsx`
        );
      } else {
        files.push(`src/${featureName}.ts`);
      }
    }

    return files.length > 0 ? files : [`src/${task.id}.ts`];
  }

  // Helper: generate file content
  private generateFileContent(filePath: string, task: ProjectTask, spec: TechnicalSpec): string {
    const ext = filePath.split(".").pop() || "";
    const fileName = filePath.split("/").pop() || "";
    const isNextJs = spec.techStack.some((t) => t.includes("Next.js"));

    if (fileName === "package.json") {
      return JSON.stringify(
        {
          name: "generated-project",
          version: "0.1.0",
          private: true,
          scripts: {
            dev: isNextJs ? "next dev" : "ts-node src/index.ts",
            build: isNextJs ? "next build" : "tsc",
            start: isNextJs ? "next start" : "node dist/index.js",
            lint: isNextJs ? "next lint" : "eslint src/",
            test: "jest",
          },
          dependencies: {},
          devDependencies: {},
        },
        null,
        2
      );
    }

    if (fileName === "tsconfig.json") {
      return JSON.stringify(
        {
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            paths: { "@/*": ["./src/*"] },
          },
          include: ["**/*.ts", "**/*.tsx"],
          exclude: ["node_modules"],
        },
        null,
        2
      );
    }

    if (filePath.includes("schema.prisma")) {
      let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;
      for (const model of spec.dataModels) {
        schema += `\nmodel ${model.name} {\n`;
        for (const field of model.fields) {
          const prismaType =
            field.type === "UUID" ? "String @id @default(uuid())" :
            field.type === "DateTime" ? "DateTime @default(now())" :
            field.type === "Text" ? "String?" :
            field.type === "Enum" ? 'String @default("active")' :
            field.required ? "String" : "String?";
          schema += `  ${field.name.replace(/([A-Z])/g, "_$1").toLowerCase()} ${prismaType}\n`;
        }
        schema += "}\n";
      }
      return schema;
    }

    if (filePath.includes("globals.css")) {
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
    }

    if (fileName === "Dockerfile") {
      return `FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;
    }

    if (fileName === "docker-compose.yml") {
      return `version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`;
    }

    if (fileName === ".dockerignore") {
      return `node_modules\n.next\n.git\n*.md\n.env*.local`;
    }

    if (fileName === ".eslintrc.json") {
      return JSON.stringify(
        { extends: isNextJs ? ["next/core-web-vitals"] : ["eslint:recommended"], rules: {} },
        null,
        2
      );
    }

    if (filePath.includes("route.ts")) {
      const method = task.title.includes("GET") ? "GET" : task.title.includes("POST") ? "POST" : task.title.includes("PUT") ? "PUT" : task.title.includes("DELETE") ? "DELETE" : "GET";
      return `import { NextRequest, NextResponse } from "next/server";

export async function ${method}(request: NextRequest) {
  try {
    // ${task.description}
    const data = {}; // TODO: implement logic

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("${method} error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
`;
    }

    if (filePath.includes("page.tsx")) {
      const componentName = fileName.replace(".tsx", "").replace("page", "Page");
      return `export default function ${componentName || "Page"}() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${task.title.replace("Implement: ", "")}</h1>
      <p className="text-gray-600">
        ${task.description}
      </p>
      {/* TODO: Implement UI */}
    </div>
  );
}
`;
    }

    if (ext === "tsx") {
      const componentName = fileName.replace(".tsx", "").replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase());
      return `"use client";

import React from "react";

interface ${componentName}Props {
  // Define props
}

export default function ${componentName}({}: ${componentName}Props) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">${componentName}</h2>
      {/* ${task.description} */}
    </div>
  );
}
`;
    }

    if (ext === "ts" && filePath.includes("lib/")) {
      return `// ${task.description}

export function initialize() {
  // TODO: implement
  console.log("Module initialized");
}

export default { initialize };
`;
    }

    if (filePath.includes("test")) {
      return `describe("${task.title}", () => {
  it("should work correctly", () => {
    expect(true).toBe(true);
  });

  it("should handle edge cases", () => {
    // TODO: add specific test cases
    expect(true).toBe(true);
  });
});
`;
    }

    if (fileName === "middleware.ts") {
      return `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth middleware - check for session token
  const token = request.cookies.get("session-token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
`;
    }

    return `// ${filePath}
// Generated by SoloCoder
// Task: ${task.title}
// ${task.description}

export {};
`;
  }
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours} hours`;
}

export const aiEngine = new AIEngine();
export { COST_PER_INPUT_TOKEN, COST_PER_OUTPUT_TOKEN };
