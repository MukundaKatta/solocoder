"use client";

import { useProjectStore } from "@/store/project-store";
import { LandingPage } from "@/components/shared/landing-page";
import { IDELayout } from "@/components/ide/ide-layout";

export default function Home() {
  const project = useProjectStore((s) => s.project);

  if (!project) {
    return <LandingPage />;
  }

  return <IDELayout />;
}
