"use client";

import React from "react";
import { useProjectStore } from "@/store/project-store";
import {
  CheckCircle2,
  FileText,
  Code2,
  Database,
  Globe,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function AgentPanel() {
  const project = useProjectStore((s) => s.project);
  const isRunning = useProjectStore((s) => s.isRunning);
  const approveSpec = useProjectStore((s) => s.approveSpec);
  const startPlanning = useProjectStore((s) => s.startPlanning);
  const spec = project?.spec;

  if (isRunning && !spec) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="w-8 h-8 text-solo-accent animate-spin" />
        <p className="text-solo-text-dim">Analyzing your project description...</p>
        <div className="w-48 h-1 bg-solo-border rounded-full overflow-hidden">
          <div className="h-full bg-solo-accent rounded-full shimmer" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-solo-text-muted">Waiting for project description...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-solo-accent" />
          Technical Specification
        </h2>
        <button
          onClick={async () => {
            approveSpec();
            await startPlanning();
          }}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          Approve & Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview */}
      <section className="glass-panel-sm p-4">
        <h3 className="text-sm font-semibold text-solo-accent mb-2">Overview</h3>
        <p className="text-sm text-solo-text-dim leading-relaxed">{spec.overview}</p>
      </section>

      {/* Architecture */}
      <section className="glass-panel-sm p-4">
        <h3 className="text-sm font-semibold text-solo-accent mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Architecture
        </h3>
        <p className="text-sm text-solo-text-dim leading-relaxed">{spec.architecture}</p>
      </section>

      {/* Tech Stack */}
      <section className="glass-panel-sm p-4">
        <h3 className="text-sm font-semibold text-solo-accent mb-2 flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {spec.techStack.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs rounded-full bg-solo-accent/10 text-solo-accent border border-solo-accent/20"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="glass-panel-sm p-4">
        <h3 className="text-sm font-semibold text-solo-accent mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Features ({spec.features.length})
        </h3>
        <div className="space-y-3">
          {spec.features.map((feature) => (
            <div key={feature.id} className="border border-solo-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{feature.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    feature.priority === "must_have"
                      ? "bg-red-500/10 text-red-400"
                      : feature.priority === "should_have"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {feature.priority.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-solo-text-dim mb-2">{feature.description}</p>
              <div className="space-y-1">
                {feature.acceptanceCriteria.map((criteria, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-solo-text-muted">
                    <span className="text-solo-accent mt-0.5">-</span>
                    {criteria}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Models */}
      {spec.dataModels.length > 0 && (
        <section className="glass-panel-sm p-4">
          <h3 className="text-sm font-semibold text-solo-accent mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Models ({spec.dataModels.length})
          </h3>
          <div className="space-y-3">
            {spec.dataModels.map((model, i) => (
              <div key={i} className="border border-solo-border rounded-lg p-3">
                <span className="text-sm font-mono font-medium text-solo-accent">{model.name}</span>
                <div className="mt-2 space-y-1">
                  {model.fields.map((field, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-solo-text">{field.name}</span>
                      <span className="text-solo-text-muted">{field.type}</span>
                      {field.required && (
                        <span className="text-red-400 text-[10px]">required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* API Endpoints */}
      {spec.apiEndpoints.length > 0 && (
        <section className="glass-panel-sm p-4">
          <h3 className="text-sm font-semibold text-solo-accent mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            API Endpoints ({spec.apiEndpoints.length})
          </h3>
          <div className="space-y-2">
            {spec.apiEndpoints.map((endpoint, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-mono py-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    endpoint.method === "GET"
                      ? "bg-green-500/10 text-green-400"
                      : endpoint.method === "POST"
                        ? "bg-blue-500/10 text-blue-400"
                        : endpoint.method === "PUT"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="text-solo-text">{endpoint.path}</span>
                <span className="text-solo-text-muted ml-auto">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Complexity */}
      <section className="glass-panel-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-solo-text-dim">Estimated Complexity</span>
          <span className="text-sm font-medium capitalize text-solo-accent">
            {spec.estimatedComplexity.replace("_", " ")}
          </span>
        </div>
      </section>
    </div>
  );
}
