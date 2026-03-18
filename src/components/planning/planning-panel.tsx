"use client";

import React from "react";
import { useProjectStore } from "@/store/project-store";
import {
  ListTodo,
  Flag,
  Clock,
  Coins,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Hand,
} from "lucide-react";
import { cn, getComplexityColor, formatDuration } from "@/lib/utils";

export function PlanningPanel() {
  const project = useProjectStore((s) => s.project);
  const isRunning = useProjectStore((s) => s.isRunning);
  const approvePlan = useProjectStore((s) => s.approvePlan);
  const startCoding = useProjectStore((s) => s.startCoding);
  const plan = project?.plan;

  if (isRunning && !plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-solo-text-dim">Generating project plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-solo-text-muted">Plan will appear here after spec approval.</p>
      </div>
    );
  }

  const completedTasks = plan.tasks.filter((t) => t.status === "completed").length;
  const humanTasks = plan.tasks.filter((t) => t.humanInterventionRequired).length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-purple-400" />
          Project Plan
        </h2>
        <button
          onClick={async () => {
            approvePlan();
            await startCoding();
          }}
          disabled={isRunning}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          Approve & Code
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<ListTodo className="w-4 h-4" />}
          label="Tasks"
          value={`${completedTasks}/${plan.tasks.length}`}
          color="text-purple-400"
        />
        <SummaryCard
          icon={<Clock className="w-4 h-4" />}
          label="Est. Time"
          value={formatDuration(plan.estimatedHours * 60)}
          color="text-blue-400"
        />
        <SummaryCard
          icon={<Zap className="w-4 h-4" />}
          label="Est. Tokens"
          value={`${(plan.estimatedTokens / 1000).toFixed(0)}K`}
          color="text-yellow-400"
        />
        <SummaryCard
          icon={<Coins className="w-4 h-4" />}
          label="Est. Cost"
          value={`$${plan.estimatedCost.toFixed(2)}`}
          color="text-green-400"
        />
      </div>

      {/* Human Intervention Notice */}
      {humanTasks > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <Hand className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Human Intervention Points</p>
            <p className="text-xs text-solo-text-dim mt-1">
              The agent will pause at {humanTasks} decision point{humanTasks > 1 ? "s" : ""} for your approval.
            </p>
          </div>
        </div>
      )}

      {/* Milestones */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Flag className="w-4 h-4 text-solo-accent" />
          Milestones ({plan.milestones.length})
        </h3>
        <div className="space-y-2">
          {plan.milestones.map((milestone) => {
            const mTasks = plan.tasks.filter((t) => milestone.taskIds.includes(t.id));
            const mCompleted = mTasks.filter((t) => t.status === "completed").length;
            const progress = mTasks.length > 0 ? (mCompleted / mTasks.length) * 100 : 0;

            return (
              <div key={milestone.id} className="glass-panel-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-solo-text-muted" />
                    )}
                    <span className="text-sm font-medium">{milestone.name}</span>
                  </div>
                  <span className="text-xs text-solo-text-muted">
                    {mCompleted}/{mTasks.length} tasks
                  </span>
                </div>
                <p className="text-xs text-solo-text-dim ml-6 mb-2">{milestone.description}</p>
                <div className="ml-6 h-1 bg-solo-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-solo-accent rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Task List */}
      <section>
        <h3 className="text-sm font-semibold mb-3">All Tasks ({plan.tasks.length})</h3>
        <div className="space-y-2">
          {plan.tasks.map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "glass-panel-sm p-3 transition-colors",
                task.status === "in_progress" && "border-solo-accent/50 animate-glow"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-xs text-solo-text-muted mt-0.5 w-5 text-right flex-shrink-0">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-sm",
                      task.status === "completed" && "text-solo-text-dim line-through"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-solo-text-muted mt-0.5 truncate">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn("text-[10px] font-medium capitalize", getComplexityColor(task.complexity))}>
                        {task.complexity}
                      </span>
                      <span className="text-[10px] text-solo-text-muted">
                        ~{task.estimatedMinutes}m
                      </span>
                      <span className="text-[10px] text-solo-text-muted capitalize">
                        {task.phase}
                      </span>
                      {task.humanInterventionRequired && (
                        <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Human review
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full flex-shrink-0",
                    task.status === "completed" && "bg-green-500/10 text-green-400",
                    task.status === "pending" && "bg-solo-border text-solo-text-muted",
                    task.status === "in_progress" && "bg-solo-accent/10 text-solo-accent",
                    task.status === "failed" && "bg-red-500/10 text-red-400",
                    task.status === "skipped" && "bg-gray-500/10 text-gray-400"
                  )}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-panel-sm p-3">
      <div className={cn("flex items-center gap-1.5 mb-1", color)}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
