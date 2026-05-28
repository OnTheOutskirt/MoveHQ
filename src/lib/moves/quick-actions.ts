import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord, PipelineStageId } from "@/lib/moves/types";

/** Always available on move detail (unless lost — then core four only). */
export const CORE_QUICK_ACTION_IDS = ["call", "sms", "email", "note"] as const;

export type CoreQuickActionId = (typeof CORE_QUICK_ACTION_IDS)[number];

/** Stage-specific slots (fifth and sixth actions in the grid). */
export type StageQuickActionId =
  | "follow-up"
  | "book-walkthrough"
  | "check-quote"
  | "send-reminder"
  | "collect-deposit"
  | "send-contract"
  | "confirm-move"
  | "ops-handoff"
  | "collect-payment"
  | "final-invoice";

export type MoveQuickActionId = CoreQuickActionId | StageQuickActionId;

export type QuickActionDef = { id: MoveQuickActionId; label: string };

export const QUICK_ACTION_LABELS: Record<MoveQuickActionId, string> = {
  call: "Call client",
  sms: "Send SMS",
  email: "Send email",
  note: "Add note",
  "follow-up": "Follow up",
  "book-walkthrough": "Book walkthrough",
  "check-quote": "Check on quote",
  "send-reminder": "Send reminder",
  "collect-deposit": "Collect deposit",
  "send-contract": "Send contract",
  "confirm-move": "Confirm move day",
  "ops-handoff": "Ops handoff",
  "collect-payment": "Record payment",
  "final-invoice": "Final invoice",
};

/** Actions that show a threaded history feed above the composer. */
export const QUICK_ACTIONS_WITH_HISTORY: CoreQuickActionId[] = [
  "call",
  "sms",
  "email",
  "note",
];

export type HistoryQuickActionId = Extract<
  MoveQuickActionId,
  "call" | "sms" | "email" | "note" | "follow-up"
>;

export function quickActionHasHistory(action: MoveQuickActionId): action is HistoryQuickActionId {
  return action === "follow-up" || QUICK_ACTIONS_WITH_HISTORY.includes(action as CoreQuickActionId);
}

export function quickActionLabel(action: MoveQuickActionId): string {
  return QUICK_ACTION_LABELS[action];
}

/** All quick actions open a slide-over panel. */
export const MOVE_QUICK_ACTIONS_WITH_PANEL: MoveQuickActionId[] = Object.keys(
  QUICK_ACTION_LABELS,
) as MoveQuickActionId[];

function stageSpecificActions(stage: PipelineStageId): QuickActionDef[] {
  switch (stage) {
    case "new_lead":
    case "waiting":
      return [
        { id: "follow-up", label: QUICK_ACTION_LABELS["follow-up"] },
        { id: "book-walkthrough", label: QUICK_ACTION_LABELS["book-walkthrough"] },
      ];
    case "quote_sent":
      return [
        { id: "check-quote", label: QUICK_ACTION_LABELS["check-quote"] },
        { id: "send-reminder", label: QUICK_ACTION_LABELS["send-reminder"] },
      ];
    case "needs_contract":
      return [
        { id: "collect-deposit", label: QUICK_ACTION_LABELS["collect-deposit"] },
        { id: "send-contract", label: QUICK_ACTION_LABELS["send-contract"] },
      ];
    case "booked":
      return [
        { id: "confirm-move", label: QUICK_ACTION_LABELS["confirm-move"] },
        { id: "ops-handoff", label: QUICK_ACTION_LABELS["ops-handoff"] },
      ];
    case "completed":
      return [
        { id: "collect-payment", label: QUICK_ACTION_LABELS["collect-payment"] },
        { id: "final-invoice", label: QUICK_ACTION_LABELS["final-invoice"] },
      ];
    default:
      return [
        { id: "follow-up", label: QUICK_ACTION_LABELS["follow-up"] },
        { id: "book-walkthrough", label: QUICK_ACTION_LABELS["book-walkthrough"] },
      ];
  }
}

/** Up to six quick actions for the move detail right rail (stage-aware). */
export function getMoveQuickActions(move: MoveRecord): QuickActionDef[] {
  const core: QuickActionDef[] = CORE_QUICK_ACTION_IDS.map((id) => ({
    id,
    label: QUICK_ACTION_LABELS[id],
  }));

  if (isMoveLost(move)) {
    return core;
  }

  return [...core, ...stageSpecificActions(move.pipelineStage)];
}

/** @deprecated Use getMoveQuickActions(move) — static list for lead/waiting only. */
export const MOVE_QUICK_ACTIONS: QuickActionDef[] = [
  ...CORE_QUICK_ACTION_IDS.map((id) => ({ id, label: QUICK_ACTION_LABELS[id] })),
  { id: "follow-up", label: QUICK_ACTION_LABELS["follow-up"] },
  { id: "book-walkthrough", label: QUICK_ACTION_LABELS["book-walkthrough"] },
];
