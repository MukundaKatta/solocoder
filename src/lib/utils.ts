import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileType, TaskComplexity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileLanguage(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, FileType> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    css: "css",
    html: "html",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    dockerfile: "dockerfile",
    sh: "shell",
    bash: "shell",
    py: "python",
    sql: "sql",
  };
  if (filename.toLowerCase() === "dockerfile") return "dockerfile";
  return map[ext] || "other";
}

export function getMonacoLanguage(fileType: FileType): string {
  const map: Record<FileType, string> = {
    typescript: "typescript",
    javascript: "javascript",
    json: "json",
    css: "css",
    html: "html",
    markdown: "markdown",
    yaml: "yaml",
    dockerfile: "dockerfile",
    shell: "shell",
    python: "python",
    sql: "sql",
    other: "plaintext",
  };
  return map[fileType];
}

export function getFileIcon(fileType: FileType): string {
  const map: Record<FileType, string> = {
    typescript: "TS",
    javascript: "JS",
    json: "{}",
    css: "#",
    html: "<>",
    markdown: "MD",
    yaml: "YM",
    dockerfile: "DK",
    shell: "$",
    python: "PY",
    sql: "DB",
    other: "?",
  };
  return map[fileType];
}

export function getComplexityColor(complexity: TaskComplexity): string {
  const map: Record<TaskComplexity, string> = {
    trivial: "text-green-400",
    simple: "text-emerald-400",
    moderate: "text-yellow-400",
    complex: "text-orange-400",
    very_complex: "text-red-400",
  };
  return map[complexity];
}

export function getComplexityMinutes(complexity: TaskComplexity): number {
  const map: Record<TaskComplexity, number> = {
    trivial: 1,
    simple: 3,
    moderate: 8,
    complex: 15,
    very_complex: 30,
  };
  return map[complexity];
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
