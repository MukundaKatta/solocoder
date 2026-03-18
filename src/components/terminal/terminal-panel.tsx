"use client";

import React, { useEffect, useRef } from "react";
import { useProjectStore } from "@/store/project-store";
import { Terminal, Trash2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TerminalLine } from "@/types";

export function TerminalPanel() {
  const terminalLines = useProjectStore((s) => s.terminalLines);
  const clearTerminal = useProjectStore((s) => s.clearTerminal);
  const isRunning = useProjectStore((s) => s.isRunning);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const lineStyles: Record<TerminalLine["type"], string> = {
    command: "text-solo-terminal-cyan",
    output: "text-solo-text-dim",
    error: "text-solo-terminal-red",
    info: "text-solo-terminal-blue",
    success: "text-solo-terminal-green",
    warning: "text-solo-terminal-yellow",
  };

  const linePrefix: Record<TerminalLine["type"], string> = {
    command: "$ ",
    output: "  ",
    error: "ERROR ",
    info: "INFO ",
    success: "OK ",
    warning: "WARN ",
  };

  return (
    <div className="h-full flex flex-col bg-solo-terminal">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-solo-border/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-solo-terminal-green" />
          <span className="text-xs font-medium text-solo-text-dim">Terminal</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] text-solo-terminal-green">
              <span className="w-1.5 h-1.5 bg-solo-terminal-green rounded-full animate-pulse" />
              running
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
              }}
              className="btn-ghost p-1"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={clearTerminal} className="btn-ghost p-1" title="Clear">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
      >
        {terminalLines.length === 0 ? (
          <div className="text-solo-text-muted">
            <span className="text-solo-terminal-green">solocoder</span>
            <span className="text-solo-text-muted">@</span>
            <span className="text-solo-terminal-blue">workspace</span>
            <span className="text-solo-text-muted"> $ </span>
            <span className="animate-typing text-solo-text-dim">_</span>
          </div>
        ) : (
          terminalLines.map((line) => (
            <div key={line.id} className={cn("terminal-line", lineStyles[line.type])}>
              <span className="text-solo-text-muted opacity-40 mr-2 select-none text-[10px]">
                {new Date(line.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
              {line.type === "command" ? (
                <>
                  <span className="text-solo-terminal-green">solocoder</span>
                  <span className="text-solo-text-muted">:</span>
                  <span className="text-solo-terminal-blue">~</span>
                  <span className="text-solo-terminal-cyan"> $ </span>
                  <span className="text-solo-text">{line.content}</span>
                </>
              ) : (
                <>
                  <span className="opacity-60">{linePrefix[line.type]}</span>
                  {line.content}
                </>
              )}
            </div>
          ))
        )}
        {isRunning && (
          <div className="terminal-line text-solo-text-muted mt-1">
            <span className="inline-block w-2 h-4 bg-solo-terminal-green animate-typing" />
          </div>
        )}
      </div>
    </div>
  );
}
