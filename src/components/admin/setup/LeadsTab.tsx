"use client";

import { LeadRoutingSection } from "@/components/admin/setup/LeadRoutingSection";
import { PriorityTierRulesSection } from "@/components/admin/setup/PriorityTierRulesSection";

export function LeadsTab() {
  return (
    <div className="space-y-4">
      <PriorityTierRulesSection />
      <LeadRoutingSection />
    </div>
  );
}
