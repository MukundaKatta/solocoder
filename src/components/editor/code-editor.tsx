"use client";

import React, { useCallback } from "react";
import { useProjectStore } from "@/store/project-store";
import { getMonacoLanguage } from "@/lib/utils";
import { FileCode2, Copy, Download, Check, X } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-solo-terminal">
      <p className="text-solo-text-muted text-sm">Loading editor...</p>
    </div>
  ),
});

export function CodeEditor() {
  const project = useProjectStore((s) => s.project);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const updateFile = useProjectStore((s) => s.updateFile);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const [copied, setCopied] = React.useState(false);

  const activeFile = project?.files.find((f) => f.id === activeFileId);
  const openFiles = project?.files.filter((f) =>
    activeFileId ? true : false
  ).slice(0, 8) || [];

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeFile && value !== undefined) {
        updateFile(activeFile.id, value);
      }
    },
    [activeFile, updateFile]
  );

  const handleCopy = async () => {
    if (activeFile) {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeFile.path.split("/").pop() || "file.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-solo-terminal">
        <FileCode2 className="w-12 h-12 text-solo-border" />
        <div className="text-center">
          <p className="text-solo-text-dim text-sm">No file selected</p>
          <p className="text-solo-text-muted text-xs mt-1">
            {project?.files.length
              ? "Select a file from the sidebar to edit"
              : "Files will appear here as the agent writes code"}
          </p>
        </div>
        {project?.files && project.files.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-md justify-center">
            {project.files.slice(0, 6).map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFile(f.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-solo-surface border border-solo-border hover:border-solo-accent/30 text-solo-text-dim hover:text-solo-text transition-colors"
              >
                {f.path.split("/").pop()}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-solo-terminal">
      {/* Tab bar */}
      <div className="flex items-center bg-solo-surface/50 border-b border-solo-border overflow-x-auto flex-shrink-0">
        {project?.files.map((file) => (
          <button
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs border-r border-solo-border whitespace-nowrap transition-colors ${
              file.id === activeFileId
                ? "bg-solo-terminal text-solo-text"
                : "text-solo-text-dim hover:text-solo-text hover:bg-solo-border/30"
            }`}
          >
            <FileCode2 className="w-3 h-3" />
            {file.path.split("/").pop()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (file.id === activeFileId) {
                  const remaining = project.files.filter((f) => f.id !== file.id);
                  setActiveFile(remaining.length > 0 ? remaining[0].id : null);
                }
              }}
              className="hover:text-red-400 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>

      {/* File info bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-solo-surface/30 border-b border-solo-border flex-shrink-0">
        <span className="text-xs text-solo-text-muted font-mono">{activeFile.path}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-solo-text-muted">
            v{activeFile.version} | {activeFile.content.split("\n").length} lines
          </span>
          <button onClick={handleCopy} className="btn-ghost p-1" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleDownload} className="btn-ghost p-1" title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explanation */}
      {activeFile.explanation && (
        <div className="px-3 py-1.5 bg-solo-accent/5 border-b border-solo-accent/20 flex-shrink-0">
          <p className="text-xs text-solo-accent">{activeFile.explanation}</p>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={getMonacoLanguage(activeFile.language)}
          value={activeFile.content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            fontLigatures: true,
            minimap: { enabled: true, maxColumn: 80 },
            scrollBeyondLastLine: false,
            padding: { top: 8, bottom: 8 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
          }}
        />
      </div>
    </div>
  );
}
