"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import {
  FileCode2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  SkipForward,
  Loader2,
} from "lucide-react";
import { cn, getFileIcon } from "@/lib/utils";
import { TaskStatus } from "@/types";

type SidebarTab = "files" | "tasks";

export function Sidebar() {
  const [tab, setTab] = useState<SidebarTab>("files");

  return (
    <div className="w-64 bg-solo-surface border-r border-solo-border flex flex-col flex-shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-solo-border">
        <button
          onClick={() => setTab("files")}
          className={cn(
            "flex-1 py-2 text-xs font-medium text-center transition-colors",
            tab === "files" ? "tab-active" : "tab-inactive"
          )}
        >
          Files
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={cn(
            "flex-1 py-2 text-xs font-medium text-center transition-colors",
            tab === "tasks" ? "tab-active" : "tab-inactive"
          )}
        >
          Tasks
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "files" ? <FileTree /> : <TaskList />}
      </div>
    </div>
  );
}

function FileTree() {
  const project = useProjectStore((s) => s.project);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const files = project?.files || [];

  // Build tree structure
  const tree = buildFileTree(files.map((f) => ({ id: f.id, path: f.path, language: f.language })));

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-solo-text-muted">
        No files yet. Start coding to generate files.
      </div>
    );
  }

  return (
    <div className="py-2">
      {renderTree(tree, 0, activeFileId, setActiveFile)}
    </div>
  );
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  fileId?: string;
  language?: string;
}

function buildFileTree(files: { id: string; path: string; language: string }[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let node = current.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          isDir: !isLast,
          children: [],
          fileId: isLast ? file.id : undefined,
          language: isLast ? file.language : undefined,
        };
        current.push(node);
      }

      if (!isLast) {
        current = node.children;
      }
    }
  }

  return root;
}

function renderTree(
  nodes: TreeNode[],
  depth: number,
  activeFileId: string | null,
  setActiveFile: (id: string | null) => void
): React.ReactNode {
  // Sort: directories first, then files
  const sorted = [...nodes].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });

  return sorted.map((node) => (
    <TreeItem
      key={node.path}
      node={node}
      depth={depth}
      activeFileId={activeFileId}
      setActiveFile={setActiveFile}
    />
  ));
}

function TreeItem({
  node,
  depth,
  activeFileId,
  setActiveFile,
}: {
  node: TreeNode;
  depth: number;
  activeFileId: string | null;
  setActiveFile: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isActive = node.fileId === activeFileId;

  return (
    <div>
      <div
        className={cn(
          "file-tree-item",
          isActive && "file-tree-item-active"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (node.isDir) {
            setExpanded(!expanded);
          } else if (node.fileId) {
            setActiveFile(node.fileId);
          }
        }}
      >
        {node.isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-solo-text-muted flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-solo-text-muted flex-shrink-0" />
            )}
            <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            <FileCode2 className="w-4 h-4 text-solo-accent flex-shrink-0" />
          </>
        )}
        <span className="truncate text-xs">{node.name}</span>
        {!node.isDir && node.language && (
          <span className="ml-auto text-[10px] text-solo-text-muted px-1.5 py-0.5 rounded bg-solo-border/50">
            {getFileIcon(node.language as any)}
          </span>
        )}
      </div>
      {node.isDir && expanded && renderTree(node.children, depth + 1, activeFileId, setActiveFile)}
    </div>
  );
}

function TaskList() {
  const project = useProjectStore((s) => s.project);
  const currentTaskId = useProjectStore((s) => s.currentTaskId);
  const tasks = project?.plan?.tasks || [];

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-sm text-solo-text-muted">
        No tasks yet. Complete the planning phase to see tasks.
      </div>
    );
  }

  const statusIcon: Record<TaskStatus, React.ReactNode> = {
    pending: <Circle className="w-3.5 h-3.5 text-solo-text-muted" />,
    in_progress: <Loader2 className="w-3.5 h-3.5 text-solo-accent animate-spin" />,
    awaiting_human: <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    failed: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
    skipped: <SkipForward className="w-3.5 h-3.5 text-solo-text-muted" />,
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="py-2">
      <div className="px-3 py-2 text-xs text-solo-text-muted">
        {completedCount}/{tasks.length} tasks completed
        <div className="mt-1 h-1.5 bg-solo-border rounded-full overflow-hidden">
          <div
            className="h-full bg-solo-accent rounded-full transition-all"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start gap-2 px-3 py-2 text-xs border-l-2 ml-2",
            task.id === currentTaskId
              ? "border-solo-accent bg-solo-accent/5"
              : task.status === "completed"
                ? "border-green-500/30"
                : task.status === "failed"
                  ? "border-red-500/30"
                  : "border-transparent"
          )}
        >
          <span className="mt-0.5 flex-shrink-0">{statusIcon[task.status]}</span>
          <div className="min-w-0">
            <p className={cn(
              "truncate",
              task.status === "completed" && "text-solo-text-dim line-through"
            )}>
              {task.title}
            </p>
            {task.humanInterventionRequired && task.status === "pending" && (
              <span className="flex items-center gap-1 text-[10px] text-yellow-400 mt-0.5">
                <Clock className="w-2.5 h-2.5" /> Needs approval
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
