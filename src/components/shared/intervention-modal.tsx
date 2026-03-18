"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { HumanIntervention } from "@/types";
import { AlertTriangle, MessageSquare, Send } from "lucide-react";

interface Props {
  intervention: HumanIntervention;
}

export function InterventionModal({ intervention }: Props) {
  const resolveIntervention = useProjectStore((s) => s.resolveIntervention);
  const [customResponse, setCustomResponse] = useState("");

  const handleOption = (option: string) => {
    resolveIntervention(intervention.id, option);
  };

  const handleCustom = () => {
    if (customResponse.trim()) {
      resolveIntervention(intervention.id, customResponse.trim());
      setCustomResponse("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative glass-panel p-6 max-w-lg w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold">Human Input Required</h3>
            <p className="text-xs text-solo-text-muted">The agent needs your decision to proceed</p>
          </div>
        </div>

        {/* Question */}
        <div className="glass-panel-sm p-4 mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-solo-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-solo-text leading-relaxed">{intervention.question}</p>
          </div>
        </div>

        {/* Options */}
        {intervention.options && intervention.options.length > 0 && (
          <div className="space-y-2 mb-4">
            {intervention.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOption(option)}
                className="w-full text-left px-4 py-3 rounded-lg border border-solo-border hover:border-solo-accent/30 hover:bg-solo-accent/5 transition-all text-sm"
              >
                <span className="text-solo-accent font-medium mr-2">{i + 1}.</span>
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Custom response */}
        <div className="border-t border-solo-border pt-4">
          <label className="text-xs text-solo-text-muted mb-2 block">Or provide custom input:</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field text-sm"
              placeholder="Type your response..."
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCustom();
              }}
            />
            <button
              onClick={handleCustom}
              disabled={!customResponse.trim()}
              className="btn-primary px-4 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
