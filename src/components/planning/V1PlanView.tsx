"use client";

import { RoadmapChecklist } from "@/components/planning/RoadmapChecklist";
import { V1_GROUPS, V1_SECTIONS } from "@/lib/planning/roadmap-data";

export function V1PlanView() {
  return <RoadmapChecklist groups={V1_GROUPS} sections={V1_SECTIONS} idPrefix="v1-grp" />;
}
