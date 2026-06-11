"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import {
  leadRoutingAssigneeLabel,
  LEAD_ROUTING_ASSIGNEE_LABELS,
  patchLeadRoutingRule,
  type LeadRoutingAssignee,
  type LeadRoutingRule,
} from "@/lib/settings/lead-routing-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

function matchSummary(rule: LeadRoutingRule, sourceLabels: Map<string, string>): string {
  switch (rule.match.type) {
    case "lead_source":
      return `Lead source is ${sourceLabels.get(rule.match.sourceId) ?? rule.match.sourceId}`;
    case "priority_tier":
      return `Quadrant is ${rule.match.tierId}`;
    case "web_quote":
      return "AI / website quote intake";
    case "default":
      return "Fallback — no other rule matched";
  }
}

export function LeadRoutingSection() {
  const { value: routing, update } = useSettingsSection("leadRouting");
  const { value: fieldCatalog } = useSettingsSection("fieldCatalog");
  const { members } = useTeamMembers();

  const sourceLabels = useMemo(
    () => new Map(fieldCatalog.leadSources.map((s) => [s.id, s.label])),
    [fieldCatalog.leadSources],
  );

  const salesReps = useMemo(() => {
    const names = members
      .filter((m) =>
        ["sales", "manager", "admin"].includes(m.permissionLevel),
      )
      .map((m) => `${m.firstName} ${m.lastName}`.trim());
    return [...new Set(names)].sort();
  }, [members]);

  const assigneeOptions: { value: LeadRoutingAssignee; label: string }[] = [
    { value: "round_robin", label: LEAD_ROUTING_ASSIGNEE_LABELS.round_robin },
    { value: "manual_queue", label: LEAD_ROUTING_ASSIGNEE_LABELS.manual_queue },
    ...salesReps.map((name) => ({ value: name, label: name })),
  ];

  const enabledCount = routing.rules.filter((r) => r.enabled).length;

  function patchRule(ruleId: string, patch: Partial<LeadRoutingRule>) {
    update(patchLeadRoutingRule(routing, ruleId, patch));
  }

  return (
    <SetupAccordion
      title="Lead routing"
      description="Who gets assigned when a new lead or web quote arrives — first match wins."
      count={routing.rules.length}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Auto-assign new leads</p>
            <p className="mt-0.5 text-xs text-slate-500">
              When on, rules below run on new lead intake. Office can still reassign manually.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={routing.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            Enabled
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fallback assignee
            </span>
            <select
              value={routing.fallbackAssignee}
              onChange={(e) => update({ fallbackAssignee: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {assigneeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={routing.notifyRepOnAssign}
              onChange={(e) => update({ notifyRepOnAssign: e.target.checked })}
              className="rounded border-slate-300"
            />
            Notify rep when assigned
          </label>
        </div>

        <p className="text-xs text-slate-500">
          {enabledCount} of {routing.rules.length} rules on · evaluated top to bottom
        </p>

        <ul className="space-y-2">
          {routing.rules.map((rule) => (
            <li
              key={rule.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                rule.enabled ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/80",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{rule.label}</h4>
                    {rule.recommended ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{rule.description}</p>
                  <p className="mt-1.5 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">When</span>{" "}
                    {matchSummary(rule, sourceLabels)}
                  </p>
                </div>
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => patchRule(rule.id, { enabled: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  On
                </label>
              </div>
              {rule.enabled ? (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <label className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-medium">Assign to</span>
                    <select
                      value={rule.assignTo}
                      onChange={(e) => patchRule(rule.id, { assignTo: e.target.value })}
                      className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800"
                    >
                      {assigneeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-slate-400">
                      → {leadRoutingAssigneeLabel(rule.assignTo)}
                    </span>
                  </label>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </SetupAccordion>
  );
}
