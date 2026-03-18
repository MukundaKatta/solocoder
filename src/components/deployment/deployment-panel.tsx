"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import {
  Container,
  FileText,
  Copy,
  Check,
  Download,
  Server,
  Cloud,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeployTab = "dockerfile" | "compose" | "env" | "notes";

export function DeploymentPanel() {
  const deploymentConfig = useProjectStore((s) => s.deploymentConfig);
  const [activeTab, setActiveTab] = useState<DeployTab>("dockerfile");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (content: string, label: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadAll = () => {
    if (!deploymentConfig) return;

    const files = [
      { name: "Dockerfile", content: deploymentConfig.dockerfile },
      { name: "docker-compose.yml", content: deploymentConfig.dockerCompose },
      { name: ".env.example", content: deploymentConfig.envTemplate },
      { name: "DEPLOYMENT.md", content: deploymentConfig.deploymentNotes },
    ];

    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (!deploymentConfig) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-solo-terminal">
        <Container className="w-12 h-12 text-solo-border" />
        <div className="text-center">
          <p className="text-solo-text-dim text-sm">Deployment not configured yet</p>
          <p className="text-solo-text-muted text-xs mt-1">
            Reach the deployment phase to generate Docker and deployment configs
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: DeployTab; label: string; icon: React.ReactNode }[] = [
    { id: "dockerfile", label: "Dockerfile", icon: <Container className="w-3.5 h-3.5" /> },
    { id: "compose", label: "Compose", icon: <Server className="w-3.5 h-3.5" /> },
    { id: "env", label: "Env Vars", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "notes", label: "Guide", icon: <Rocket className="w-3.5 h-3.5" /> },
  ];

  const content: Record<DeployTab, string> = {
    dockerfile: deploymentConfig.dockerfile,
    compose: deploymentConfig.dockerCompose,
    env: deploymentConfig.envTemplate,
    notes: deploymentConfig.deploymentNotes,
  };

  return (
    <div className="h-full flex flex-col bg-solo-terminal">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-solo-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">Deployment Configuration</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
            {deploymentConfig.platform}
          </span>
        </div>
        <button onClick={handleDownloadAll} className="btn-secondary text-xs flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Download All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-solo-border px-2 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        <button
          onClick={() => handleCopy(content[activeTab], activeTab)}
          className="absolute top-3 right-3 btn-ghost p-1.5 bg-solo-surface border border-solo-border z-10"
          title="Copy"
        >
          {copied === activeTab ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <pre className="p-4 text-xs font-mono text-solo-text leading-relaxed whitespace-pre-wrap">
          {content[activeTab]}
        </pre>
      </div>
    </div>
  );
}
