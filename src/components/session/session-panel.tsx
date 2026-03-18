"use client";

import React from "react";
import { useProjectStore } from "@/store/project-store";
import { Clock, Play, Pause, CheckCircle2, Zap, Hash } from "lucide-react";
import { cn, formatTokens } from "@/lib/utils";

export function SessionPanel() {
  const project = useProjectStore((s) => s.project);
  const activeSession = useProjectStore((s) => s.activeSession);
  const currentPhase = useProjectStore((s) => s.currentPhase);
  const isPaused = useProjectStore((s) => s.isPaused);
  const isRunning = useProjectStore((s) => s.isRunning);
  const costEstimate = useProjectStore((s) => s.costEstimate);

  const sessions = project?.sessions || [];

  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Current Session */}
      {activeSession && (
        <div className="glass-panel-sm p-4 mb-4 border-solo-accent/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-green-400 animate-pulse" : isPaused ? "bg-yellow-400" : "bg-solo-text-muted"
              )} />
              Current Session
            </h3>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full",
              isRunning ? "bg-green-500/10 text-green-400" : isPaused ? "bg-yellow-500/10 text-yellow-400" : "bg-solo-border text-solo-text-muted"
            )}>
              {isRunning ? "Running" : isPaused ? "Paused" : "Idle"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-solo-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> Started
              </span>
              <p className="text-xs font-medium mt-0.5">
                {new Date(activeSession.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-solo-text-muted flex items-center gap-1">
                <Hash className="w-3 h-3" /> Phase
              </span>
              <p className="text-xs font-medium mt-0.5 capitalize">{currentPhase}</p>
            </div>
            <div>
              <span className="text-[10px] text-solo-text-muted flex items-center gap-1">
                <Zap className="w-3 h-3" /> Tokens
              </span>
              <p className="text-xs font-medium mt-0.5">{formatTokens(costEstimate.totalTokens)}</p>
            </div>
          </div>

          {/* Session duration */}
          <div className="mt-3 pt-3 border-t border-solo-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-solo-text-muted">Duration</span>
              <SessionTimer startedAt={activeSession.startedAt} isRunning={isRunning || isPaused} />
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      <h3 className="text-sm font-semibold mb-3">Session History</h3>
      {sessions.length === 0 && !activeSession ? (
        <p className="text-xs text-solo-text-muted">No sessions yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="glass-panel-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {session.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : session.status === "paused" ? (
                    <Pause className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-solo-accent" />
                  )}
                  <span className="text-xs font-medium capitalize">{session.phase}</span>
                </div>
                <span className="text-[10px] text-solo-text-muted">
                  {new Date(session.startedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-solo-text-muted">
                <span>{session.tasksCompleted} tasks</span>
                <span>{formatTokens(session.tokensUsed)} tokens</span>
                {session.endedAt && (
                  <span>
                    {Math.round(
                      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
                    )}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 glass-panel-sm p-4">
        <h3 className="text-sm font-semibold mb-3">Project Stats</h3>
        <div className="space-y-2">
          <StatRow label="Total files" value={String(project?.files.length || 0)} />
          <StatRow
            label="Total lines of code"
            value={String(project?.files.reduce((s, f) => s + f.content.split("\n").length, 0) || 0)}
          />
          <StatRow
            label="Tasks completed"
            value={`${project?.plan?.tasks.filter((t) => t.status === "completed").length || 0}/${project?.plan?.tasks.length || 0}`}
          />
          <StatRow label="Current phase" value={currentPhase} />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-solo-text-muted">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function SessionTimer({ startedAt, isRunning }: { startedAt: string; isRunning: boolean }) {
  const [elapsed, setElapsed] = React.useState("00:00");

  React.useEffect(() => {
    if (!isRunning) return;

    const update = () => {
      const diff = Date.now() - new Date(startedAt).getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isRunning]);

  return <span className="font-mono">{elapsed}</span>;
}
