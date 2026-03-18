"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { AgentPanel } from "../intake/agent-panel";
import { PlanningPanel } from "../planning/planning-panel";
import { CodeEditor } from "../editor/code-editor";
import { TerminalPanel } from "../terminal/terminal-panel";
import { PreviewPanel } from "../preview/preview-panel";
import { CostPanel } from "../cost/cost-panel";
import { DeploymentPanel } from "../deployment/deployment-panel";
import { InterventionModal } from "../shared/intervention-modal";
import { SessionPanel } from "../session/session-panel";

type RightPanelTab = "editor" | "preview" | "deployment";
type BottomPanelTab = "terminal" | "agent" | "cost" | "sessions";

export function IDELayout() {
  const currentPhase = useProjectStore((s) => s.currentPhase);
  const pendingIntervention = useProjectStore((s) => s.pendingIntervention);
  const [rightTab, setRightTab] = useState<RightPanelTab>("editor");
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>("agent");
  const [bottomHeight, setBottomHeight] = useState(320);

  const showPlanning = currentPhase === "planning" || currentPhase === "intake";

  return (
    <div className="h-screen flex flex-col bg-solo-bg overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Area — Planning or Editor */}
          <div className="flex-1 flex overflow-hidden">
            {showPlanning && (
              <div className="w-full lg:w-1/2 border-r border-solo-border overflow-hidden">
                {currentPhase === "intake" ? <AgentPanel /> : <PlanningPanel />}
              </div>
            )}

            <div className={`${showPlanning ? "hidden lg:flex lg:flex-1" : "flex-1"} flex flex-col overflow-hidden`}>
              {/* Right panel tabs */}
              <div className="flex items-center border-b border-solo-border bg-solo-surface/50 px-2">
                {(["editor", "preview", "deployment"] as RightPanelTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      rightTab === tab ? "tab-active" : "tab-inactive"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-hidden">
                {rightTab === "editor" && <CodeEditor />}
                {rightTab === "preview" && <PreviewPanel />}
                {rightTab === "deployment" && <DeploymentPanel />}
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div
            className="border-t border-solo-border flex flex-col"
            style={{ height: bottomHeight }}
          >
            {/* Resize handle */}
            <div
              className="h-1 bg-solo-border hover:bg-solo-accent cursor-row-resize flex-shrink-0"
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startH = bottomHeight;
                const onMove = (ev: MouseEvent) => {
                  const delta = startY - ev.clientY;
                  setBottomHeight(Math.max(150, Math.min(600, startH + delta)));
                };
                const onUp = () => {
                  document.removeEventListener("mousemove", onMove);
                  document.removeEventListener("mouseup", onUp);
                };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}
            />

            {/* Bottom tabs */}
            <div className="flex items-center border-b border-solo-border bg-solo-surface/50 px-2 flex-shrink-0">
              {(["terminal", "agent", "cost", "sessions"] as BottomPanelTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                    bottomTab === tab ? "tab-active" : "tab-inactive"
                  }`}
                >
                  {tab === "agent" ? "Agent Log" : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {bottomTab === "terminal" && <TerminalPanel />}
              {bottomTab === "agent" && <AgentLog />}
              {bottomTab === "cost" && <CostPanel />}
              {bottomTab === "sessions" && <SessionPanel />}
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Modal */}
      {pendingIntervention && !pendingIntervention.response && (
        <InterventionModal intervention={pendingIntervention} />
      )}
    </div>
  );
}

function AgentLog() {
  const messages = useProjectStore((s) => s.agentMessages);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-solo-text-muted text-sm">Agent messages will appear here...</p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`text-sm ${
            msg.role === "agent"
              ? "text-solo-text"
              : msg.role === "system"
                ? "text-solo-text-dim italic"
                : "text-solo-accent"
          }`}
        >
          <span className="text-xs text-solo-text-muted mr-2">
            [{new Date(msg.timestamp).toLocaleTimeString()}]
          </span>
          <span className={`font-medium mr-2 ${
            msg.role === "agent" ? "text-solo-accent" : "text-solo-text-dim"
          }`}>
            {msg.role === "agent" ? "SoloCoder" : msg.role}:
          </span>
          <span className="whitespace-pre-wrap">{msg.content}</span>
          {msg.metadata?.tokensUsed && (
            <span className="text-xs text-solo-text-muted ml-2">
              ({msg.metadata.tokensUsed.toLocaleString()} tokens)
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
