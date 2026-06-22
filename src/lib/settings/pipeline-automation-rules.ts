import type {
  FollowUpChannel,
  FollowUpType,
  PipelineStageId,
  PriorityTierId,
} from "@/lib/moves/types";

export const AUTOMATION_QUADRANT_IDS: PriorityTierId[] = ["Q1", "Q2", "Q3", "Q4"];

export type AutomationTriggerKind =
  | "stage_enter"
  | "document_quote_sent"
  | "deposit_collected"
  | "dispatch_published"
  | "days_before_move"
  | "day_of_move";

export type AutomationActionKind =
  | "follow_up_task"
  | "send_sms"
  | "send_email"
  | "office_notify"
  | "crew_app_push";

export type AutomationSectionId =
  | "lead"
  | "sales"
  | "booking"
  | "move_day"
  | "post_move";

/** Admin workspace tabs — group pipeline phases for browsing rules. */
export type AutomationWorkspaceId = "sales" | "ops" | "post_move" | "settings";

export const AUTOMATION_WORKSPACE_LABELS: Record<
  Exclude<AutomationWorkspaceId, "settings">,
  string
> = {
  sales: "Sales",
  ops: "Operations",
  post_move: "After move",
};

export const AUTOMATION_WORKSPACE_SECTIONS: Record<
  Exclude<AutomationWorkspaceId, "settings">,
  AutomationSectionId[]
> = {
  sales: ["lead", "sales"],
  ops: ["booking", "move_day"],
  post_move: ["post_move"],
};

export function workspaceForSection(section: AutomationSectionId): Exclude<AutomationWorkspaceId, "settings"> {
  if (section === "lead" || section === "sales") return "sales";
  if (section === "booking" || section === "move_day") return "ops";
  return "post_move";
}

export function defaultSectionForWorkspace(
  workspace: Exclude<AutomationWorkspaceId, "settings">,
): AutomationSectionId {
  if (workspace === "sales") return "sales";
  if (workspace === "ops") return "booking";
  return "post_move";
}

/** Admin UI grouping — a rule can match multiple categories via its actions. */
export type AutomationRuleCategory = "follow_ups" | "messages" | "internal";

/** One action in an automation sequence, fired after a delay relative to the previous step. */
export type AutomationStep = {
  id: string;
  action: AutomationActionKind;
  /** Delay (days) after the previous step; the first step is relative to the trigger firing. */
  delayDays?: number;
  /** Delay (minutes) after the previous step; the first step is relative to the trigger firing. */
  delayMinutes?: number;
  smsTemplateId?: string;
  emailTemplateId?: string;
  followUpTitle?: string;
  followUpChannel?: FollowUpChannel;
  followUpType?: FollowUpType;
};

export type PipelineAutomationRule = {
  id: string;
  label: string;
  description: string;
  section: AutomationSectionId;
  trigger: AutomationTriggerKind;
  /** For stage_enter — which pipeline stage fires the rule. */
  stage?: PipelineStageId;
  enabled: boolean;
  /** Shipped with the app vs user-created. */
  builtin: boolean;
  /** @deprecated Use builtin — kept for saved settings migration. */
  recommended?: boolean;
  actions: AutomationActionKind[];
  /** Ordered action sequence. When present, supersedes the flat `actions` + timing fields. */
  steps?: AutomationStep[];
  /** When true, do not recreate if an open or completed task/message already exists for this rule. */
  skipIfDone: boolean;
  /** Minutes after trigger (stage enter). */
  delayMinutes?: number;
  /** Days after trigger (stage enter / document sent). */
  delayDays?: number;
  /** For days_before_move — calendar days before first job day. */
  daysBeforeMove?: number;
  /** Hour of day (0–23) for scheduled customer messages. */
  sendAtHour?: number;
  smsTemplateId?: string;
  emailTemplateId?: string;
  followUpType?: FollowUpType;
  followUpTitle?: string;
  followUpChannel?: FollowUpChannel;
  /** Requires published dispatch before day-before crew messages send. */
  requiresPublishedSchedule?: boolean;
  /** When set, rule only runs for these quadrants. Empty = all quadrants. */
  quadrants?: PriorityTierId[];
};

export type PipelineAutomationSettings = {
  rules: PipelineAutomationRule[];
};

export const AUTOMATION_SECTION_LABELS: Record<AutomationSectionId, string> = {
  lead: "Lead intake",
  sales: "Sales pipeline",
  booking: "Booking & pre-move",
  move_day: "Move day",
  post_move: "Post-move",
};

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTriggerKind, string> = {
  stage_enter: "Enters pipeline stage",
  document_quote_sent: "Quote document sent",
  deposit_collected: "Deposit collected",
  dispatch_published: "Dispatch schedule published",
  days_before_move: "Days before move day",
  day_of_move: "Morning of move day",
};

export const AUTOMATION_ACTION_LABELS: Record<AutomationActionKind, string> = {
  follow_up_task: "Follow-up task",
  send_sms: "SMS",
  send_email: "Email",
  office_notify: "Office alert",
  crew_app_push: "Crew app push",
};

export const AUTOMATION_CATEGORY_LABELS: Record<AutomationRuleCategory, string> = {
  follow_ups: "Follow-up tasks",
  messages: "Customer SMS & email",
  internal: "Internal alerts",
};

export const AUTOMATION_ACTION_OPTIONS: AutomationActionKind[] = [
  "follow_up_task",
  "send_sms",
  "send_email",
  "office_notify",
  "crew_app_push",
];

const CATEGORY_ACTIONS: Record<AutomationRuleCategory, AutomationActionKind[]> = {
  follow_ups: ["follow_up_task"],
  messages: ["send_sms", "send_email"],
  internal: ["office_notify", "crew_app_push"],
};

/** Stable per-action suffix so migrated builtin rules keep their original dedupe ids. */
const ACTION_STEP_SUFFIX: Record<AutomationActionKind, string> = {
  follow_up_task: "task",
  send_sms: "sms",
  send_email: "email",
  office_notify: "notify",
  crew_app_push: "push",
};

/** Resolve a rule's ordered steps, deriving them from the legacy actions + timing when absent. */
export function migrateRuleToSteps(rule: PipelineAutomationRule): AutomationStep[] {
  if (rule.steps && rule.steps.length > 0) return rule.steps;
  const actions = rule.actions?.length
    ? rule.actions
    : (["follow_up_task"] as AutomationActionKind[]);
  return actions.map((action, index) => ({
    id: ACTION_STEP_SUFFIX[action] ?? `step-${index + 1}`,
    action,
    // First step inherits the rule's flat timing; later steps fire at the same time (delay 0).
    delayMinutes: index === 0 ? rule.delayMinutes : undefined,
    delayDays: index === 0 ? rule.delayDays : undefined,
    smsTemplateId: action === "send_sms" ? rule.smsTemplateId : undefined,
    emailTemplateId: action === "send_email" ? rule.emailTemplateId : undefined,
    followUpTitle: action === "follow_up_task" ? rule.followUpTitle : undefined,
    followUpChannel: action === "follow_up_task" ? rule.followUpChannel : undefined,
    followUpType: action === "follow_up_task" ? rule.followUpType : undefined,
  }));
}

/** Distinct action kinds a rule performs, derived from steps when present. */
export function ruleActionKinds(rule: PipelineAutomationRule): AutomationActionKind[] {
  const fromSteps =
    rule.steps && rule.steps.length > 0 ? rule.steps.map((s) => s.action) : rule.actions;
  return [...new Set(fromSteps?.length ? fromSteps : (["follow_up_task"] as AutomationActionKind[]))];
}

export function automationRuleCategories(rule: PipelineAutomationRule): AutomationRuleCategory[] {
  const kinds = ruleActionKinds(rule);
  const cats: AutomationRuleCategory[] = [];
  for (const [category, actions] of Object.entries(CATEGORY_ACTIONS) as [
    AutomationRuleCategory,
    AutomationActionKind[],
  ][]) {
    if (kinds.some((a) => actions.includes(a))) cats.push(category);
  }
  return cats.length > 0 ? cats : ["follow_ups"];
}

export function rulesInCategory(
  rules: PipelineAutomationRule[],
  category: AutomationRuleCategory | "all",
): PipelineAutomationRule[] {
  if (category === "all") return rules;
  return rules.filter((r) => automationRuleCategories(r).includes(category));
}

export function defaultActionsForCategory(
  category: AutomationRuleCategory,
): AutomationActionKind[] {
  const actions = CATEGORY_ACTIONS[category];
  return actions.length > 0 ? [actions[0]!] : ["follow_up_task"];
}

export function filterRulesByWorkspace(
  rules: PipelineAutomationRule[],
  workspace: Exclude<AutomationWorkspaceId, "settings">,
): PipelineAutomationRule[] {
  const sections = AUTOMATION_WORKSPACE_SECTIONS[workspace];
  return rules.filter((r) => sections.includes(r.section));
}

export function filterWorkspaceRulesByCategory(
  rules: PipelineAutomationRule[],
  workspace: Exclude<AutomationWorkspaceId, "settings">,
  category: AutomationRuleCategory,
): PipelineAutomationRule[] {
  return rulesInCategory(filterRulesByWorkspace(rules, workspace), category);
}

export function ruleAppliesToQuadrant(
  rule: PipelineAutomationRule,
  tier: PriorityTierId | null,
): boolean {
  if (!rule.quadrants?.length) return true;
  if (!tier) return false;
  return rule.quadrants.includes(tier);
}

export function filterRulesByQuadrant(
  rules: PipelineAutomationRule[],
  quadrant: PriorityTierId | "all",
): PipelineAutomationRule[] {
  if (quadrant === "all") return rules;
  return rules.filter((r) => ruleAppliesToQuadrant(r, quadrant));
}

export function toggleRuleQuadrant(
  rule: PipelineAutomationRule,
  tier: PriorityTierId,
): PriorityTierId[] {
  const current = rule.quadrants ?? [];
  if (current.length === 0) {
    return AUTOMATION_QUADRANT_IDS.filter((q) => q !== tier);
  }
  if (current.includes(tier)) {
    const next = current.filter((q) => q !== tier);
    return next.length === 0 ? [] : next;
  }
  const next = [...current, tier];
  return next.length === AUTOMATION_QUADRANT_IDS.length ? [] : next;
}

function rule(
  partial: Partial<PipelineAutomationRule> &
    Pick<PipelineAutomationRule, "id" | "label" | "trigger" | "section">,
): PipelineAutomationRule {
  return {
    description: "",
    enabled: true,
    builtin: true,
    skipIfDone: true,
    actions: ["follow_up_task"],
    ...partial,
    recommended: undefined,
  };
}

export function defaultPipelineAutomationRules(): PipelineAutomationRule[] {
  return [
    rule({
      id: "lead-office-notify",
      label: "Notify office on new lead",
      description: "Alert on-call sales when a lead or web quote arrives.",
      section: "lead",
      trigger: "stage_enter",
      stage: "new_lead",
      actions: ["office_notify"],
    }),
    rule({
      id: "lead-first-contact",
      label: "First contact call",
      description: "Rep task to call within 15 minutes of a new lead.",
      section: "lead",
      trigger: "stage_enter",
      stage: "new_lead",
      actions: ["follow_up_task"],
      delayMinutes: 15,
      followUpType: "first_contact",
      followUpTitle: "Call lead within 15 minutes",
      followUpChannel: "call",
    }),
    rule({
      id: "waiting-info-nudge",
      label: "Waiting — request missing info",
      description: "Email task when a lead sits in Waiting.",
      section: "sales",
      trigger: "stage_enter",
      stage: "waiting",
      actions: ["follow_up_task"],
      delayDays: 1,
      followUpType: "info_request",
      followUpTitle: "Request missing details",
      followUpChannel: "email",
    }),
    rule({
      id: "quote-sent-sms",
      label: "Quote sent — confirmation SMS",
      description: "Automatic text when a quote goes out.",
      section: "sales",
      trigger: "document_quote_sent",
      actions: ["send_sms"],
      smsTemplateId: "sms-quote-sent-confirm",
    }),
    rule({
      id: "quote-sent-follow-up",
      label: "Quote sent — sales follow-up",
      description: "Call task two days after quote is sent.",
      section: "sales",
      trigger: "stage_enter",
      stage: "quote_sent",
      actions: ["follow_up_task"],
      delayDays: 2,
      followUpType: "proposal_follow_up",
      followUpTitle: "Follow up on proposal",
      followUpChannel: "call",
    }),
    rule({
      id: "needs-contract-email",
      label: "Needs contract — reminder email",
      description: "Email when customer is ready to sign.",
      section: "sales",
      trigger: "stage_enter",
      stage: "needs_contract",
      actions: ["send_email"],
      emailTemplateId: "email-contract-ready",
    }),
    rule({
      id: "needs-contract-task",
      label: "Needs contract — rep reminder",
      description: "Follow-up task if contract is still unsigned.",
      section: "sales",
      trigger: "stage_enter",
      stage: "needs_contract",
      actions: ["follow_up_task"],
      delayDays: 1,
      followUpType: "contract_reminder",
      followUpTitle: "Send contract reminder",
      followUpChannel: "email",
    }),
    rule({
      id: "booked-confirmation-email",
      label: "Booked — confirmation email",
      description: "Welcome email with move date when deposit is collected.",
      section: "booking",
      trigger: "stage_enter",
      stage: "booked",
      actions: ["send_email"],
      emailTemplateId: "email-booking-confirm",
    }),
    rule({
      id: "booked-check-in",
      label: "Booked — pre-move check-in",
      description: "Rep call a few days before move day.",
      section: "booking",
      trigger: "stage_enter",
      stage: "booked",
      actions: ["follow_up_task"],
      delayDays: 3,
      followUpType: "booking_confirm",
      followUpTitle: "Confirm booking details",
      followUpChannel: "call",
    }),
    rule({
      id: "booked-ops-coordination",
      label: "Booked — ops coordination",
      description: "Internal task for ops to review access and crew needs.",
      section: "booking",
      trigger: "stage_enter",
      stage: "booked",
      actions: ["follow_up_task"],
      delayDays: 5,
      followUpType: "ops_coordination",
      followUpTitle: "Review move access & crew plan",
      followUpChannel: "task",
    }),
    rule({
      id: "day-before-crew-sms",
      label: "Day before — crew intro SMS",
      description:
        "Evening SMS with a link to meet tomorrow's crew (from published schedule).",
      section: "move_day",
      trigger: "days_before_move",
      actions: ["send_sms"],
      daysBeforeMove: 1,
      sendAtHour: 18,
      smsTemplateId: "sms-day-before-crew",
      requiresPublishedSchedule: true,
    }),
    rule({
      id: "day-before-crew-email",
      label: "Day before — crew intro email",
      description: "Email version with crew photos and bios on the customer portal.",
      section: "move_day",
      trigger: "days_before_move",
      actions: ["send_email"],
      daysBeforeMove: 1,
      sendAtHour: 18,
      emailTemplateId: "email-day-before-crew",
      requiresPublishedSchedule: true,
    }),
    rule({
      id: "day-before-crew-push",
      label: "Day before — crew app reminder",
      description: "Push assigned crew their job details the evening before.",
      section: "move_day",
      trigger: "days_before_move",
      actions: ["crew_app_push"],
      daysBeforeMove: 1,
      sendAtHour: 17,
    }),
    rule({
      id: "day-of-confirm-sms",
      label: "Move day — morning confirmation SMS",
      description: "Short confirmation text the morning of the move.",
      section: "move_day",
      trigger: "day_of_move",
      actions: ["send_sms"],
      sendAtHour: 7,
      smsTemplateId: "sms-ops-day-confirm",
    }),
    rule({
      id: "completed-review-email",
      label: "Completed — crew feedback email",
      description:
        "Thank-you email with link to rate the crew (1–5). Google review is offered on the portal only when the rating meets your threshold.",
      section: "post_move",
      trigger: "stage_enter",
      stage: "completed",
      actions: ["send_email", "follow_up_task"],
      delayDays: 3,
      emailTemplateId: "email-review-request",
      followUpType: "review_request",
      followUpTitle: "Ask for review",
      followUpChannel: "email",
    }),
    rule({
      id: "completed-review-sms",
      label: "Completed — crew feedback SMS",
      description:
        "Friendly text with crew feedback portal link a few days post-move — not a direct Google review link.",
      section: "post_move",
      trigger: "stage_enter",
      stage: "completed",
      actions: ["send_sms"],
      delayDays: 4,
      smsTemplateId: "sms-review-request",
    }),
  ];
}

export function defaultPipelineAutomations(): PipelineAutomationSettings {
  return { rules: defaultPipelineAutomationRules() };
}

export function normalizePipelineAutomations(
  raw: Partial<PipelineAutomationSettings> | null | undefined,
): PipelineAutomationSettings {
  const defaults = defaultPipelineAutomationRules();
  const saved = raw?.rules ?? [];
  const byId = new Map(saved.map((r) => [r.id, r]));

  const rules = defaults.map((def) => {
    const existing = byId.get(def.id);
    if (!existing) return { ...def };
    return normalizeRule({ ...def, ...existing });
  });

  for (const extra of saved) {
    if (!defaults.some((d) => d.id === extra.id)) {
      rules.push(normalizeRule(extra));
    }
  }

  return { rules };
}

function normalizeRule(rule: PipelineAutomationRule): PipelineAutomationRule {
  const builtin = rule.builtin ?? (rule.recommended !== false && !rule.id.startsWith("custom-"));
  const normalized: PipelineAutomationRule = {
    ...rule,
    builtin,
    skipIfDone: rule.skipIfDone ?? true,
    actions: rule.actions?.length ? rule.actions : ["follow_up_task"],
    recommended: undefined,
  };
  return { ...normalized, steps: migrateRuleToSteps(normalized) };
}

export function slugFromAutomationLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "rule";
}

export function addCustomPipelineAutomationRule(
  settings: PipelineAutomationSettings,
  partial: Pick<PipelineAutomationRule, "label" | "trigger" | "section"> &
    Partial<PipelineAutomationRule>,
): { settings: PipelineAutomationSettings; ruleId: string } {
  const base = slugFromAutomationLabel(partial.label);
  let id = `custom-${base}`;
  let n = 2;
  while (settings.rules.some((r) => r.id === id)) {
    id = `custom-${base}-${n}`;
    n++;
  }
  const rule: PipelineAutomationRule = normalizeRule({
    description: "",
    enabled: true,
    builtin: false,
    skipIfDone: true,
    actions: ["follow_up_task"],
    ...partial,
    id,
  });
  return { settings: { rules: [...settings.rules, rule] }, ruleId: id };
}

export function removePipelineAutomationRule(
  settings: PipelineAutomationSettings,
  ruleId: string,
): PipelineAutomationSettings {
  return {
    rules: settings.rules.filter((r) => r.id !== ruleId || r.builtin),
  };
}

export function patchPipelineAutomationRule(
  settings: PipelineAutomationSettings,
  ruleId: string,
  patch: Partial<PipelineAutomationRule>,
): PipelineAutomationSettings {
  return {
    rules: settings.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
  };
}
