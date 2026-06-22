"use client";

import { RoadmapChecklist } from "@/components/planning/RoadmapChecklist";
import { V2_GROUPS, V2_SECTIONS } from "@/lib/planning/roadmap-data";

export function V2PlanView() {
  return <RoadmapChecklist groups={V2_GROUPS} sections={V2_SECTIONS} idPrefix="v2-grp" />;
}
