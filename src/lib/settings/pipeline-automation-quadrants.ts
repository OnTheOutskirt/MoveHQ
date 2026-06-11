import { getMovePriorityTier } from "@/lib/moves/move-priority-tier";
import type { MoveRecord, PipelineStageId } from "@/lib/moves/types";
import { catalogFollowUpModeForTier } from "@/lib/settings/priority-tier-rules-runtime";
import {
  ruleAppliesToQuadrant,
  type PipelineAutomationRule,
} from "./pipeline-automation-rules";

const HIGH_TOUCH_STAGES: PipelineStageId[] = ["new_lead", "booked", "needs_contract"];

const CUSTOMER_FACING_ACTIONS = new Set(["follow_up_task", "send_sms", "send_email"]);

function isCustomerFacingRule(rule: PipelineAutomationRule): boolean {
  return rule.actions.some((a) => CUSTOMER_FACING_ACTIONS.has(a));
}

/** Whether a pipeline automation rule should run for this move (quadrant policy + scope). */
export function automationRuleAppliesToMove(
  rule: PipelineAutomationRule,
  move: MoveRecord,
  stage?: PipelineStageId,
): boolean {
  if (!rule.enabled) return false;

  const tier = getMovePriorityTier(move);
  if (!ruleAppliesToQuadrant(rule, tier)) return false;
  if (!tier) return true;

  const mode = catalogFollowUpModeForTier(tier);
  if (mode === "manual" && isCustomerFacingRule(rule)) return false;

  if (
    mode === "mixed" &&
    stage &&
    isCustomerFacingRule(rule) &&
    HIGH_TOUCH_STAGES.includes(stage)
  ) {
    return false;
  }

  return true;
}
