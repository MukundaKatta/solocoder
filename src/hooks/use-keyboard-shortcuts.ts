"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/project-store";

export function useKeyboardShortcuts() {
  const {
    isRunning,
    isPaused,
    pauseSession,
    resumeSession,
    stopAgent,
    toggleEditorSidebar,
  } = useProjectStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Shift + P — Pause/Resume
      if (isMeta && e.shiftKey && e.key === "p") {
        e.preventDefault();
        if (isRunning) pauseSession();
        else if (isPaused) resumeSession();
      }

      // Cmd/Ctrl + Shift + S — Stop agent
      if (isMeta && e.shiftKey && e.key === "s") {
        e.preventDefault();
        stopAgent();
      }

      // Cmd/Ctrl + B — Toggle sidebar
      if (isMeta && e.key === "b") {
        e.preventDefault();
        toggleEditorSidebar();
      }

      // Escape — Stop agent if running
      if (e.key === "Escape" && isRunning) {
        stopAgent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isPaused, pauseSession, resumeSession, stopAgent, toggleEditorSidebar]);
}
