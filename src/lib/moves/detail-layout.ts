/** Workspace tabs below the pipeline on move detail (overview is always visible above). */

export const MOVE_DETAIL_MAIN_TABS = [
  { id: "move-plan", label: "Move Scope" },
  { id: "quote-contract", label: "Quote & Contract" },
  { id: "operations", label: "Operations" },
  { id: "profitability", label: "Profitability" },
  { id: "activity", label: "Activity" },
] as const;

export type MoveDetailMainTabId = (typeof MOVE_DETAIL_MAIN_TABS)[number]["id"];

/** Tailwind class: main tab bar sticks to the top of the move detail scroll area. */
export const MOVE_DETAIL_STICKY_TABS_TOP = "top-0";

/** Tailwind class: section pills stick below the main tab bar (~43px). */
export const MOVE_DETAIL_STICKY_SCOPE_TOP = "top-[2.6875rem]";

/** Scroll margin for in-tab section anchors (tabs + section sub-nav). */
export const MOVE_DETAIL_SECTION_SCROLL_MARGIN = "scroll-mt-28";

export function isMoveDetailMainTabId(value: string): value is MoveDetailMainTabId {
  return MOVE_DETAIL_MAIN_TABS.some((t) => t.id === value);
}

export {
  getMoveQuickActions,
  MOVE_QUICK_ACTIONS,
  MOVE_QUICK_ACTIONS_WITH_PANEL,
  quickActionHasHistory,
  quickActionLabel,
  type MoveQuickActionId,
  type QuickActionDef,
} from "@/lib/moves/quick-actions";
