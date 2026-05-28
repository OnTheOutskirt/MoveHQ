"use client";

import { ChecklistGroup } from "@/components/planning/ChecklistGroup";
import { V1_CHECKLIST_MONTHS, groupsByMonth } from "@/lib/planning/checklist-order";
import { V1_GROUPS } from "@/lib/planning/roadmap-data";

export function V1PlanChecklist() {
  const sections = groupsByMonth(V1_GROUPS, V1_CHECKLIST_MONTHS);

  return (
    <div className="space-y-8">
      {sections.map(({ section, groups }) => (
        <section key={section.id}>
          <div className="mb-3 border-b border-slate-200 pb-2">
            <h3 className="text-base font-semibold text-slate-900">{section.label}</h3>
            <p className="text-sm text-slate-500">{section.dateRange}</p>
          </div>
          <div className="space-y-4">
            {groups.map((group) => (
              <ChecklistGroup key={group.id} group={group} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
