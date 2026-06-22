import { getMovePriorityTier } from "@/lib/moves/move-priority-tier";
import { followUpSourceForMove } from "@/lib/settings/priority-tier-rules-runtime";
import type { MoveFollowUp, MoveRecord, PipelineStageId } from "@/lib/moves/types";
import { automationRuleAppliesToMove } from "./pipeline-automation-quadrants";
import {
  defaultPipelineAutomations,
  migrateRuleToSteps,
  type AutomationStep,
  type AutomationTriggerKind,
  type PipelineAutomationRule,
  type PipelineAutomationSettings,
} from "./pipeline-automation-rules";

let cachedRules: PipelineAutomationRule[] = defaultPipelineAutomations().rules;

export function syncPipelineAutomationRuntime(settings: PipelineAutomationSettings): void {
  cachedRules = settings.rules;
}

export function getPipelineAutomationRules(): PipelineAutomationRule[] {
  return cachedRules;
}

export function enabledRules(): PipelineAutomationRule[] {
  return cachedRules.filter((r) => r.enabled);
}

export function rulesForStageEnter(stage: PipelineStageId): PipelineAutomationRule[] {
  return enabledRules().filter((r) => r.trigger === "stage_enter" && r.stage === stage);
}

export function rulesForTrigger(trigger: AutomationTriggerKind): PipelineAutomationRule[] {
  return enabledRules().filter((r) => r.trigger === trigger);
}

export function hasEnabledStageAutomations(stage: PipelineStageId): boolean {
  return rulesForStageEnter(stage).length > 0;
}

function scheduledDueOnDate(dateKey: string, hour: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function subtractDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function primaryMoveDate(move: MoveRecord): string | null {
  const jobDates = move.jobDays?.map((d) => d.date).filter(Boolean) ?? [];
  if (jobDates.length > 0) {
    return [...jobDates].sort()[0] ?? null;
  }
  return move.preferredDate || null;
}

function automationFollowUpId(moveId: string, ruleId: string, suffix: string): string {
  return `auto-${ruleId}-${suffix}-${moveId}`;
}

function followUpsForRule(followUps: MoveFollowUp[], ruleId: string): MoveFollowUp[] {
  return followUps.filter(
    (f) => f.automationRuleId === ruleId || f.id.startsWith(`auto-${ruleId}-`),
  );
}

/** Skip creating a new automation row when the work is already done or still open. */
export function shouldSkipAutomationFollowUp(
  followUps: MoveFollowUp[],
  ruleId: string,
  partial: Omit<MoveFollowUp, "id" | "moveId">,
  _skipIfDone?: boolean,
): boolean {
  const byRule = followUpsForRule(followUps, ruleId);
  if (byRule.some((f) => f.status === "open")) return true;
  if (byRule.some((f) => f.status === "completed" || f.status === "skipped")) return true;

  if (partial.type !== "custom") {
    const sameType = followUps.filter(
      (f) =>
        f.type === partial.type &&
        f.linkedStage === partial.linkedStage &&
        (f.channel === partial.channel || partial.channel === "task"),
    );
    if (sameType.some((f) => f.status === "completed" || f.status === "skipped")) return true;
    if (sameType.some((f) => f.status === "open" && f.source !== "manual")) return true;
  }

  return false;
}

function buildFollowUpFromStep(
  move: MoveRecord,
  rule: PipelineAutomationRule,
  step: AutomationStep,
  dueAt: string,
  linkedStage: PipelineStageId,
): Omit<MoveFollowUp, "id" | "moveId"> {
  const source = followUpSourceForMove(getMovePriorityTier(move), linkedStage);
  return {
    type: step.followUpType ?? rule.followUpType ?? "custom",
    title: step.followUpTitle ?? rule.followUpTitle ?? rule.label,
    dueAt,
    assignedTo: move.assignedRep,
    channel: step.followUpChannel ?? rule.followUpChannel ?? "task",
    status: "open",
    linkedStage,
    source: source === "automation" ? "scheduled" : source,
    automationRuleId: rule.id,
  };
}

function messageFollowUpFromStep(
  move: MoveRecord,
  rule: PipelineAutomationRule,
  step: AutomationStep,
  dueAt: string,
  linkedStage: PipelineStageId,
  channel: "sms" | "email",
): Omit<MoveFollowUp, "id" | "moveId"> {
  const templateId =
    channel === "sms"
      ? (step.smsTemplateId ?? rule.smsTemplateId)
      : (step.emailTemplateId ?? rule.emailTemplateId);
  const label = channel === "sms" ? "SMS" : "Email";
  return {
    type: "custom",
    title: `${label}: ${rule.label}${templateId ? ` (${templateId})` : ""}`,
    dueAt,
    assignedTo: move.assignedRep,
    channel,
    status: "open",
    linkedStage,
    source: "scheduled",
    automationRuleId: rule.id,
    notes: rule.requiresPublishedSchedule
      ? "Sends after dispatch schedule is published for this job day."
      : undefined,
  };
}

function pushFollowUpFromStep(
  move: MoveRecord,
  rule: PipelineAutomationRule,
  dueAt: string,
  linkedStage: PipelineStageId,
): Omit<MoveFollowUp, "id" | "moveId"> {
  return {
    type: "ops_coordination",
    title: `Crew app: ${rule.label}`,
    dueAt,
    assignedTo: move.assignedRep,
    channel: "task",
    status: "open",
    linkedStage,
    source: "scheduled",
    automationRuleId: rule.id,
  };
}

function stepToFollowUp(
  move: MoveRecord,
  rule: PipelineAutomationRule,
  step: AutomationStep,
  dueAt: string,
  linkedStage: PipelineStageId,
): Omit<MoveFollowUp, "id" | "moveId"> | null {
  switch (step.action) {
    case "follow_up_task":
      return buildFollowUpFromStep(move, rule, step, dueAt, linkedStage);
    case "send_sms":
      return messageFollowUpFromStep(move, rule, step, dueAt, linkedStage, "sms");
    case "send_email":
      return messageFollowUpFromStep(move, rule, step, dueAt, linkedStage, "email");
    case "crew_app_push":
      return pushFollowUpFromStep(move, rule, dueAt, linkedStage);
    case "office_notify":
    default:
      // Office alerts are not materialized as follow-ups (parity with prior behavior).
      return null;
  }
}

export type AutomationFollowUpDraft = Omit<MoveFollowUp, "moveId"> & { ruleId: string };

/** Walk a rule's steps from a base time, accumulating each step's delay, and push drafts. */
function emitRuleSteps(
  move: MoveRecord,
  rule: PipelineAutomationRule,
  baseMs: number,
  linkedStage: PipelineStageId,
  results: AutomationFollowUpDraft[],
): void {
  let cumulativeMs = 0;
  for (const step of migrateRuleToSteps(rule)) {
    cumulativeMs += (step.delayMinutes ?? 0) * 60_000 + (step.delayDays ?? 0) * 86_400_000;
    const dueAt = new Date(baseMs + cumulativeMs).toISOString();
    const partial = stepToFollowUp(move, rule, step, dueAt, linkedStage);
    if (!partial) continue;
    if (shouldSkipAutomationFollowUp(move.followUps, rule.id, partial, rule.skipIfDone)) continue;
    results.push({
      ...partial,
      id: automationFollowUpId(move.id, rule.id, step.id),
      ruleId: rule.id,
    });
  }
}

export function followUpsForStageEnter(
  move: MoveRecord,
  stage: PipelineStageId,
  atMs = Date.now(),
): AutomationFollowUpDraft[] {
  const results: AutomationFollowUpDraft[] = [];

  for (const rule of rulesForStageEnter(stage)) {
    if (!automationRuleAppliesToMove(rule, move, stage)) continue;
    emitRuleSteps(move, rule, atMs, stage, results);
  }

  return results;
}

export function scheduledFollowUpsForMove(move: MoveRecord): AutomationFollowUpDraft[] {
  const moveDate = primaryMoveDate(move);
  if (!moveDate) return [];
  if (move.pipelineStage !== "booked" && move.pipelineStage !== "completed") return [];

  const linkedStage: PipelineStageId =
    move.pipelineStage === "completed" ? "completed" : "booked";
  const results: AutomationFollowUpDraft[] = [];

  for (const rule of rulesForTrigger("days_before_move")) {
    if (!automationRuleAppliesToMove(rule, move, linkedStage)) continue;
    const daysBefore = rule.daysBeforeMove ?? 1;
    const sendDate = subtractDays(moveDate, daysBefore);
    const baseMs = new Date(scheduledDueOnDate(sendDate, rule.sendAtHour ?? 18)).getTime();
    emitRuleSteps(move, rule, baseMs, linkedStage, results);
  }

  for (const rule of rulesForTrigger("day_of_move")) {
    if (!automationRuleAppliesToMove(rule, move, linkedStage)) continue;
    const baseMs = new Date(scheduledDueOnDate(moveDate, rule.sendAtHour ?? 7)).getTime();
    emitRuleSteps(move, rule, baseMs, linkedStage, results);
  }

  return results;
}

export function mergeAutomationFollowUps(move: MoveRecord, stage: PipelineStageId): MoveRecord {
  if (move.automationsSuppressed) return move;
  const existingIds = new Set(move.followUps.map((f) => f.id));
  const drafts = [...followUpsForStageEnter(move, stage), ...scheduledFollowUpsForMove(move)];
  const toAdd = drafts
    .filter((d) => !existingIds.has(d.id))
    .map(({ ruleId: _ruleId, ...partial }) => ({
      ...partial,
      moveId: move.id,
    }));

  if (toAdd.length === 0) return move;
  return { ...move, followUps: [...move.followUps, ...toAdd] };
}
