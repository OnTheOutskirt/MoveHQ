import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";

/** Always available on move detail (unless lost — then core four only). */
export const CORE_QUICK_ACTION_IDS = ["call", "sms", "email", "note"] as const;

export type CoreQuickActionId = (typeof CORE_QUICK_ACTION_IDS)[number];

/** Extra shortcuts — bottom two vary by stage; all appear under “See all”. */
export type ExtendedQuickActionId =
  | "book-walkthrough"
  | "view-profitability"
  | "view-portal";

/** Panel-only — opened from follow-ups sidebar, not the quick-action grid. */
export type FollowUpComposerActionId = "add-follow-up";

export type MoveQuickActionId = CoreQuickActionId | ExtendedQuickActionId | FollowUpComposerActionId;

export type QuickActionDef = { id: MoveQuickActionId; label: string };

export const QUICK_ACTION_LABELS: Record<MoveQuickActionId, string> = {
  call: "Call client",
  sms: "Send SMS",
  email: "Send email",
  note: "Add note",
  "book-walkthrough": "Book walkthrough",
  "add-follow-up": "Add follow-up task",
  "view-profitability": "View profitability",
  "view-portal": "View portal",
};

/** Opens a main tab — no slide-over composer. */
export const NAVIGATION_QUICK_ACTION_IDS = ["view-profitability"] as const;

export type NavigationQuickActionId = (typeof NAVIGATION_QUICK_ACTION_IDS)[number];

/** Opens the customer portal in a new tab. */
export const EXTERNAL_QUICK_ACTION_IDS = ["view-portal"] as const;

export type ExternalQuickActionId = (typeof EXTERNAL_QUICK_ACTION_IDS)[number];

/** Actions that show a threaded history feed above the composer. */
export const QUICK_ACTIONS_WITH_HISTORY: CoreQuickActionId[] = ["call", "sms", "email", "note"];

export type HistoryQuickActionId = CoreQuickActionId;

export function quickActionHasHistory(action: MoveQuickActionId): action is HistoryQuickActionId {
  return QUICK_ACTIONS_WITH_HISTORY.includes(action as CoreQuickActionId);
}

export function quickActionLabel(action: MoveQuickActionId): string {
  return QUICK_ACTION_LABELS[action];
}

export function isNavigationQuickAction(
  action: MoveQuickActionId,
): action is NavigationQuickActionId {
  return (NAVIGATION_QUICK_ACTION_IDS as readonly string[]).includes(action);
}

export function isExternalQuickAction(
  action: MoveQuickActionId,
): action is ExternalQuickActionId {
  return (EXTERNAL_QUICK_ACTION_IDS as readonly string[]).includes(action);
}

export function quickActionOpensPanel(action: MoveQuickActionId): boolean {
  if (isNavigationQuickAction(action) || isExternalQuickAction(action)) return false;
  return true;
}

/** @deprecated Use quickActionOpensPanel */
export const MOVE_QUICK_ACTIONS_WITH_PANEL: MoveQuickActionId[] = (
  Object.keys(QUICK_ACTION_LABELS) as MoveQuickActionId[]
).filter(quickActionOpensPanel);

const EXTENDED_QUICK_ACTION_IDS: ExtendedQuickActionId[] = [
  "book-walkthrough",
  "view-profitability",
  "view-portal",
];

function extendedAction(id: ExtendedQuickActionId): QuickActionDef {
  return { id, label: QUICK_ACTION_LABELS[id] };
}

function stageSpecificActions(move: MoveRecord): QuickActionDef[] {
  switch (move.pipelineStage) {
    case "new_lead":
      return [extendedAction("book-walkthrough"), extendedAction("view-portal")];
    case "waiting":
      return [extendedAction("book-walkthrough"), extendedAction("view-portal")];
    case "quote_sent":
      return [extendedAction("view-portal"), extendedAction("view-profitability")];
    case "needs_contract":
      return [extendedAction("view-portal"), extendedAction("view-profitability")];
    case "booked":
      return [extendedAction("view-profitability"), extendedAction("view-portal")];
    case "completed":
      return [extendedAction("view-profitability"), extendedAction("view-portal")];
    default:
      return [extendedAction("book-walkthrough"), extendedAction("view-portal")];
  }
}

function coreQuickActions(): QuickActionDef[] {
  return CORE_QUICK_ACTION_IDS.map((id) => ({
    id,
    label: QUICK_ACTION_LABELS[id],
  }));
}

/** Six quick actions: core four + two for the current pipeline stage. */
export function getMoveQuickActions(move: MoveRecord): QuickActionDef[] {
  const core = coreQuickActions();

  if (isMoveLost(move)) {
    return core;
  }

  return [...core, ...stageSpecificActions(move)];
}

/** Full quick-action menu (core + every extended shortcut). */
export function getAllMoveQuickActions(move: MoveRecord): QuickActionDef[] {
  if (isMoveLost(move)) {
    return coreQuickActions();
  }

  return [...coreQuickActions(), ...EXTENDED_QUICK_ACTION_IDS.map(extendedAction)];
}

export function moveQuickActionsHasMore(move: MoveRecord): boolean {
  if (isMoveLost(move)) return false;
  return getAllMoveQuickActions(move).length > getMoveQuickActions(move).length;
}

/** @deprecated Use getMoveQuickActions(move) */
export const MOVE_QUICK_ACTIONS: QuickActionDef[] = [
  ...CORE_QUICK_ACTION_IDS.map((id) => ({ id, label: QUICK_ACTION_LABELS[id] })),
  extendedAction("book-walkthrough"),
];
