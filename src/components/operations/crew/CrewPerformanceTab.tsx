"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart3 } from "lucide-react";

export function CrewPerformanceTab() {
  return (
    <EmptyState
      icon={BarChart3}
      title="Performance"
      description="Crew performance metrics and scorecards will appear here."
    />
  );
}
