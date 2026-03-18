"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/store/project-store";
import {
  Code2,
  Terminal,
  Bug,
  Rocket,
  Brain,
  Zap,
  GitBranch,
  Layout,
  Shield,
  Clock,
} from "lucide-react";

export function LandingPage() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = useProjectStore((s) => s.createProject);
  const startIntake = useProjectStore((s) => s.startIntake);

  const handleStart = async () => {
    if (!projectName.trim() || !description.trim()) return;
    createProject(projectName.trim(), description.trim());
    await startIntake(description.trim());
  };

  const features = [
    { icon: Brain, title: "AI Spec Generation", desc: "Describe your project, get a full technical spec" },
    { icon: GitBranch, title: "Smart Planning", desc: "Auto-generated tasks, milestones, and timeline" },
    { icon: Code2, title: "Autonomous Coding", desc: "Writes code file by file with explanations" },
    { icon: Terminal, title: "Live Terminal", desc: "Watch the agent execute commands in real-time" },
    { icon: Layout, title: "Monaco Editor", desc: "Full code editor with live updates" },
    { icon: Bug, title: "Debug Loop", desc: "Runs code, reads errors, fixes automatically" },
    { icon: Shield, title: "Human-in-Loop", desc: "Agent pauses for your approval at key points" },
    { icon: Rocket, title: "Auto-Deploy", desc: "Generates Dockerfile and deployment configs" },
    { icon: Clock, title: "Session Management", desc: "Pause and resume long-running sessions" },
    { icon: Zap, title: "Cost Tracking", desc: "Real-time token usage and cost estimates" },
  ];

  const examples = [
    "Build a task management app with Next.js, user authentication, real-time updates, and a Kanban board",
    "Create a REST API for a blog platform with posts, comments, tags, and user roles using Express and PostgreSQL",
    "Build a personal finance dashboard with expense tracking, budgets, charts, and CSV import",
  ];

  return (
    <div className="min-h-screen bg-solo-bg">
      {/* Gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-solo-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solo-accent/10 border border-solo-accent/20 text-solo-accent text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Autonomous AI Software Engineer
          </div>
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-solo-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SoloCoder
            </span>
          </h1>
          <p className="text-xl text-solo-text-dim max-w-2xl mx-auto">
            Describe what you want built. Watch an AI agent write every file,
            run commands, debug errors, and deploy your project — all in a full IDE experience.
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-panel p-8 max-w-3xl mx-auto mb-16">
          <div className="mb-6">
            <label className="block text-sm font-medium text-solo-text-dim mb-2">
              Project Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="my-awesome-project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-solo-text-dim mb-2">
              Describe what you want built
            </label>
            <textarea
              className="textarea-field h-40"
              placeholder="Build a full-stack web application that..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Example prompts */}
          <div className="mb-6">
            <p className="text-xs text-solo-text-muted mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDescription(example);
                    if (!projectName) setProjectName(`project-${i + 1}`);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-solo-border/50 hover:bg-solo-border text-solo-text-dim hover:text-solo-text transition-colors"
                >
                  {example.slice(0, 50)}...
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!projectName.trim() || !description.trim()}
            className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Start Building
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-panel-sm p-4 text-center hover:border-solo-accent/30 transition-colors"
            >
              <feature.icon className="w-6 h-6 text-solo-accent mx-auto mb-2" />
              <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
              <p className="text-xs text-solo-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "Describe", desc: "Tell SoloCoder what to build" },
              { step: "2", title: "Spec", desc: "AI generates technical specification" },
              { step: "3", title: "Plan", desc: "Tasks, milestones, and timeline" },
              { step: "4", title: "Code", desc: "Agent writes code file by file" },
              { step: "5", title: "Deploy", desc: "Docker configs and deployment" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-full bg-solo-accent/20 border border-solo-accent/40 flex items-center justify-center text-solo-accent font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-solo-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
