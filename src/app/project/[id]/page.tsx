"use client";

import React, { useEffect } from "react";
import { useProjectStore } from "@/store/project-store";
import { IDELayout } from "@/components/ide/ide-layout";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = useProjectStore((s) => s.project);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.id)
          .single();

        if (fetchError) {
          setError("Project not found");
          setLoading(false);
          return;
        }

        if (data) {
          loadProject({
            id: data.id,
            name: data.name,
            description: data.description,
            phase: data.phase,
            spec: data.spec,
            plan: data.plan,
            files: data.files || [],
            sessions: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            totalTokensUsed: data.total_tokens_used || 0,
            estimatedCost: data.estimated_cost || 0,
          });
        }
      } catch {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (!project || project.id !== params.id) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [params.id, project, loadProject]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-solo-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-solo-accent animate-spin" />
          <p className="text-solo-text-dim">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-solo-bg">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-solo-text-dim">{error}</p>
          <a href="/" className="btn-primary mt-4 inline-block">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <IDELayout />;
}
