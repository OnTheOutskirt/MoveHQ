import type { PriorityTierId } from "@/lib/moves/types";

export type LeadRoutingAssignee = "round_robin" | "manual_queue" | string;

export type LeadRoutingMatch =
  | { type: "lead_source"; sourceId: string }
  | { type: "priority_tier"; tierId: PriorityTierId }
  | { type: "web_quote" }
  | { type: "default" };

export type LeadRoutingRule = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  recommended: boolean;
  match: LeadRoutingMatch;
  assignTo: LeadRoutingAssignee;
};

export type LeadRoutingSettings = {
  enabled: boolean;
  fallbackAssignee: LeadRoutingAssignee;
  notifyRepOnAssign: boolean;
  rules: LeadRoutingRule[];
};

export const LEAD_ROUTING_ASSIGNEE_LABELS: Record<string, string> = {
  round_robin: "Round robin — sales team",
  manual_queue: "Manual — office picks rep",
};

export function leadRoutingAssigneeLabel(assignee: LeadRoutingAssignee): string {
  return LEAD_ROUTING_ASSIGNEE_LABELS[assignee] ?? assignee;
}

function rule(
  partial: Omit<LeadRoutingRule, "enabled" | "recommended"> & {
    enabled?: boolean;
    recommended?: boolean;
  },
): LeadRoutingRule {
  return {
    enabled: partial.enabled ?? partial.recommended !== false,
    recommended: partial.recommended ?? true,
    ...partial,
  };
}

export function defaultLeadRoutingRules(): LeadRoutingSettings {
  return {
    enabled: true,
    fallbackAssignee: "round_robin",
    notifyRepOnAssign: true,
    rules: [
      rule({
        id: "route-web-quote",
        label: "AI / website quotes",
        description: "Web intakes and auto-quotes go to the on-call rep queue first.",
        match: { type: "web_quote" },
        assignTo: "round_robin",
      }),
      rule({
        id: "route-q1",
        label: "Q1 priority leads",
        description: "Hot source + high value — fastest response, senior rep pool.",
        match: { type: "priority_tier", tierId: "Q1" },
        assignTo: "Alex Rivera",
      }),
      rule({
        id: "route-realtor",
        label: "Realtor referrals",
        description: "Partner referrals stay with the partner rep when set.",
        match: { type: "lead_source", sourceId: "referral_realtor" },
        assignTo: "Sarah Kim",
      }),
      rule({
        id: "route-google",
        label: "Google / paid search",
        description: "Paid leads distributed round robin.",
        match: { type: "lead_source", sourceId: "google" },
        assignTo: "round_robin",
      }),
      rule({
        id: "route-default",
        label: "All other new leads",
        description: "Fallback when no specific rule matches.",
        match: { type: "default" },
        assignTo: "round_robin",
      }),
    ],
  };
}

export function normalizeLeadRoutingRules(
  raw: Partial<LeadRoutingSettings> | null | undefined,
): LeadRoutingSettings {
  const defaults = defaultLeadRoutingRules();
  if (!raw) return defaults;

  const savedById = new Map((raw.rules ?? []).map((r) => [r.id, r]));
  const rules = defaults.rules.map((def) => {
    const existing = savedById.get(def.id);
    return existing ? { ...def, ...existing, match: { ...def.match, ...existing.match } } : def;
  });

  for (const extra of raw.rules ?? []) {
    if (!defaults.rules.some((d) => d.id === extra.id)) {
      rules.push(extra);
    }
  }

  return {
    enabled: raw.enabled ?? defaults.enabled,
    fallbackAssignee: raw.fallbackAssignee ?? defaults.fallbackAssignee,
    notifyRepOnAssign: raw.notifyRepOnAssign ?? defaults.notifyRepOnAssign,
    rules,
  };
}

export function patchLeadRoutingRule(
  settings: LeadRoutingSettings,
  ruleId: string,
  patch: Partial<LeadRoutingRule>,
): LeadRoutingSettings {
  return {
    ...settings,
    rules: settings.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
  };
}
