"use client";

import React from "react";
import { useProjectStore } from "@/store/project-store";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Loader2,
  ArrowRight,
  Home,
  DollarSign,
} from "lucide-react";
import { cn, formatCost, formatTokens } from "@/lib/utils";

const phaseLabels: Record<string, string> = {
  intake: "Project Intake",
  planning: "Planning",
  coding: "Coding",
  debugging: "Debugging",
  deployment: "Deployment",
  completed: "Completed",
  paused: "Paused",
};

const phaseColors: Record<string, string> = {
  intake: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  planning: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  coding: "bg-green-500/20 text-green-400 border-green-500/30",
  debugging: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  deployment: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export function TopBar() {
  const {
    project,
    currentPhase,
    isRunning,
    isPaused,
    costEstimate,
    pauseSession,
    resumeSession,
    stopAgent,
    approveSpec,
    startPlanning,
    approvePlan,
    startCoding,
    startDebugging,
    startDeployment,
    setPhase,
    resetStore,
  } = useProjectStore();

  const handleNextPhase = async () => {
    switch (currentPhase) {
      case "intake":
        if (project?.spec) {
          approveSpec();
          await startPlanning();
        }
        break;
      case "planning":
        if (project?.plan) {
          approvePlan();
          await startCoding();
        }
        break;
      case "coding":
        await startDebugging();
        break;
      case "debugging":
        await startDeployment();
        break;
      case "deployment":
        setPhase("completed");
        break;
    }
  };

  const nextPhaseLabel: Record<string, string> = {
    intake: "Start Planning",
    planning: "Start Coding",
    coding: "Run Debug",
    debugging: "Deploy",
    deployment: "Complete",
  };

  return (
    <div className="h-12 bg-solo-surface border-b border-solo-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={resetStore} className="btn-ghost flex items-center gap-1.5">
          <Home className="w-4 h-4" />
        </button>
        <div className="h-5 w-px bg-solo-border" />
        <span className="text-sm font-medium text-solo-text truncate max-w-[200px]">
          {project?.name || "SoloCoder"}
        </span>
        <span className={cn("phase-badge border", phaseColors[currentPhase])}>
          {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
          {phaseLabels[currentPhase]}
        </span>
      </div>

      {/* Center — Controls */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <>
            <button onClick={pauseSession} className="btn-ghost flex items-center gap-1.5 text-yellow-400">
              <Pause className="w-4 h-4" />
              <span className="text-xs">Pause</span>
            </button>
            <button onClick={stopAgent} className="btn-ghost flex items-center gap-1.5 text-red-400">
              <Square className="w-4 h-4" />
              <span className="text-xs">Stop</span>
            </button>
          </>
        ) : isPaused ? (
          <button onClick={resumeSession} className="btn-ghost flex items-center gap-1.5 text-green-400">
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs">Resume</span>
          </button>
        ) : currentPhase !== "completed" ? (
          <button
            onClick={handleNextPhase}
            disabled={
              (currentPhase === "intake" && !project?.spec) ||
              (currentPhase === "planning" && !project?.plan)
            }
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Play className="w-3 h-3" />
            {nextPhaseLabel[currentPhase] || "Next"}
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : null}
      </div>

      {/* Right — Cost & Token Info */}
      <div className="flex items-center gap-4 text-xs text-solo-text-dim">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{formatCost(costEstimate.totalCost)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{formatTokens(costEstimate.totalTokens)} tokens</span>
        </div>
        {project?.files && (
          <div className="flex items-center gap-1">
            <span>{project.files.length} files</span>
          </div>
        )}
      </div>
    </div>
  );
}
