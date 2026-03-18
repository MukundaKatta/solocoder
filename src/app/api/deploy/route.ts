import { NextRequest, NextResponse } from "next/server";

// POST /api/deploy — generate deployment artifacts
export async function POST(request: NextRequest) {
  try {
    const { files, projectName, techStack } = await request.json();

    if (!files || !projectName) {
      return NextResponse.json({ error: "files and projectName required" }, { status: 400 });
    }

    const hasNextJs = techStack?.some((t: string) => t.includes("Next.js"));
    const hasPostgres = techStack?.some((t: string) => t.includes("PostgreSQL"));

    // Generate Dockerfile
    const dockerfile = hasNextJs
      ? `# Multi-stage build for Next.js
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]`
      : `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

    // Generate docker-compose
    let dockerCompose = `version: "3.8"

services:
  ${projectName}:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`;

    if (hasPostgres) {
      dockerCompose += `
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${projectName.replace(/-/g, "_")}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${projectName.replace(/-/g, "_")}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:`;
    } else {
      dockerCompose += `
    restart: unless-stopped`;
    }

    // Generate .dockerignore
    const dockerignore = `node_modules
.next
.git
*.md
.env*.local
.DS_Store
coverage
.nyc_output`;

    return NextResponse.json({
      dockerfile,
      dockerCompose,
      dockerignore,
      commands: {
        build: `docker-compose build`,
        start: `docker-compose up -d`,
        stop: `docker-compose down`,
        logs: `docker-compose logs -f ${projectName}`,
      },
    });
  } catch (error) {
    console.error("Deploy API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
