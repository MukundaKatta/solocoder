"use client";

import React from "react";
import { useProjectStore } from "@/store/project-store";
import { DollarSign, Zap, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCost, formatTokens, cn } from "@/lib/utils";
import { ProjectPhase } from "@/types";

const phaseLabels: Record<ProjectPhase, string> = {
  intake: "Intake",
  planning: "Planning",
  coding: "Coding",
  debugging: "Debugging",
  deployment: "Deployment",
  completed: "Completed",
  paused: "Paused",
};

const phaseColors: Record<ProjectPhase, string> = {
  intake: "bg-blue-500",
  planning: "bg-purple-500",
  coding: "bg-green-500",
  debugging: "bg-orange-500",
  deployment: "bg-cyan-500",
  completed: "bg-emerald-500",
  paused: "bg-yellow-500",
};

export function CostPanel() {
  const costEstimate = useProjectStore((s) => s.costEstimate);
  const project = useProjectStore((s) => s.project);

  const estimatedBudget = project?.plan?.estimatedCost || 0;
  const budgetUsedPercent = estimatedBudget > 0
    ? Math.min((costEstimate.totalCost / estimatedBudget) * 100, 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Cost */}
        <div className="glass-panel-sm p-3">
          <div className="flex items-center gap-1.5 text-green-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Total Cost</span>
          </div>
          <span className="text-xl font-bold">{formatCost(costEstimate.totalCost)}</span>
          {estimatedBudget > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-solo-text-muted mb-1">
                <span>Budget used</span>
                <span>{budgetUsedPercent.toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-solo-border rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    budgetUsedPercent > 80 ? "bg-red-500" : "bg-green-500"
                  )}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Total Tokens */}
        <div className="glass-panel-sm p-3">
          <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Total Tokens</span>
          </div>
          <span className="text-xl font-bold">{formatTokens(costEstimate.totalTokens)}</span>
        </div>

        {/* Input Tokens */}
        <div className="glass-panel-sm p-3">
          <div className="flex items-center gap-1.5 text-blue-400 mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs">Input Tokens</span>
          </div>
          <span className="text-xl font-bold">{formatTokens(costEstimate.inputTokens)}</span>
          <p className="text-[10px] text-solo-text-muted mt-1">
            @ {formatCost(costEstimate.costPerInputToken)}/token
          </p>
        </div>

        {/* Output Tokens */}
        <div className="glass-panel-sm p-3">
          <div className="flex items-center gap-1.5 text-purple-400 mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-xs">Output Tokens</span>
          </div>
          <span className="text-xl font-bold">{formatTokens(costEstimate.outputTokens)}</span>
          <p className="text-[10px] text-solo-text-muted mt-1">
            @ {formatCost(costEstimate.costPerOutputToken)}/token
          </p>
        </div>
      </div>

      {/* Cost by Phase */}
      {costEstimate.breakdown.length > 0 && (
        <div className="glass-panel-sm p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-solo-accent" />
            Cost by Phase
          </h3>
          <div className="space-y-3">
            {costEstimate.breakdown.map((item) => {
              const maxCost = Math.max(...costEstimate.breakdown.map((b) => b.cost));
              const percentage = maxCost > 0 ? (item.cost / maxCost) * 100 : 0;

              return (
                <div key={item.phase}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", phaseColors[item.phase])} />
                      <span className="text-xs">{phaseLabels[item.phase]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-solo-text-dim">
                      <span>{formatTokens(item.tokens)} tokens</span>
                      <span className="font-mono">{formatCost(item.cost)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-solo-border rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", phaseColors[item.phase])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost Projection */}
      {project?.plan && (
        <div className="glass-panel-sm p-4 mt-4">
          <h3 className="text-sm font-semibold mb-3">Cost Projection</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-solo-text-muted text-xs">Spent so far</span>
              <p className="font-bold text-lg">{formatCost(costEstimate.totalCost)}</p>
            </div>
            <div>
              <span className="text-solo-text-muted text-xs">Estimated total</span>
              <p className="font-bold text-lg">{formatCost(project.plan.estimatedCost)}</p>
            </div>
            <div>
              <span className="text-solo-text-muted text-xs">Remaining budget</span>
              <p className="font-bold text-lg">
                {formatCost(Math.max(0, project.plan.estimatedCost - costEstimate.totalCost))}
              </p>
            </div>
            <div>
              <span className="text-solo-text-muted text-xs">Cost per file</span>
              <p className="font-bold text-lg">
                {project.files.length > 0
                  ? formatCost(costEstimate.totalCost / project.files.length)
                  : "$0.00"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
