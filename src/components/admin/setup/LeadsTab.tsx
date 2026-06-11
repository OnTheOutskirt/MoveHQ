"use client";

import { LeadRoutingSection } from "@/components/admin/setup/LeadRoutingSection";
import { PriorityTierRulesSection } from "@/components/admin/setup/PriorityTierRulesSection";
import Link from "next/link";

export function LeadsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Score and route incoming leads before they hit the pipeline. Lead source labels are edited
        under{" "}
        <Link
          href="/admin/setup?tab=pipeline"
          className="font-medium text-brand-600 hover:underline"
        >
          Pipeline &amp; fields
        </Link>
        ; hot/cold, quadrant labels (Q1–Q4), and routing are here. Per-quadrant follow-up and
        automation behavior is under Setup → Automations.
      </p>
      <PriorityTierRulesSection />
      <LeadRoutingSection />
    </div>
  );
}
