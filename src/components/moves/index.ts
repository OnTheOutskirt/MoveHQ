/**
 * Moves module — UI components catalog and public exports.
 */

export { MoveListView } from "./MoveListView";
export { MovePipelineBoard } from "./MovePipelineBoard";
export { MoveStatusBadge } from "./MoveStatusBadge";
export { MovesProvider, useMoves } from "./MovesProvider";
export { MovesWorkspace } from "./MovesWorkspace";
export { MoveDetailView, MoveDetailNotFound } from "./detail/MoveDetailView";
export { MoveDetailOverviewCard } from "./detail/MoveDetailOverviewCard";
export { MoveDetailRightRail } from "./detail/MoveDetailRightRail";
export { MoveDetailMain } from "./detail/MoveDetailMain";
/** @deprecated Use MoveDetailRightRail */
export { MoveDetailActivitySidebar } from "./detail/MoveDetailActivitySidebar";
export { MoveDetailBackLink } from "./detail/MoveDetailBackLink";
export { MoveCompactTile } from "./shared/MoveCompactTile";
export { MovesToolbar } from "./shared/MovesToolbar";
export { useMovesFilters } from "./hooks/use-moves-filters";
export type { MovesFilters } from "./hooks/use-moves-filters";

export type { MovesViewMode } from "@/lib/moves/view-mode";
export { MOVES_VIEW_MODES } from "@/lib/moves/view-mode";

/** Registry of Moves workspace UI pieces (paths are import aliases). */
export const MOVES_UI_COMPONENTS = [
  {
    key: "view-switcher",
    name: "ViewSwitcher",
    path: "@/components/ui/ViewSwitcher",
    usedFor: "Pipeline / List toggle on Moves",
  },
  {
    key: "moves-toolbar",
    name: "MovesToolbar",
    path: "@/components/moves/shared/MovesToolbar",
    usedFor: "View switcher (pipeline / list), salesperson filter",
  },
  {
    key: "pipeline-board",
    name: "MovePipelineBoard",
    path: "@/components/moves/MovePipelineBoard",
    usedFor: "Kanban pipeline by move stage",
  },
  {
    key: "list-view",
    name: "MoveListView",
    path: "@/components/moves/MoveListView",
    usedFor: "Sortable table of moves",
  },
  {
    key: "detail-view",
    name: "MoveDetailView",
    path: "@/components/moves/detail/MoveDetailView",
    usedFor: "Move detail shell — overview bar, tabs, tool rail",
  },
  {
    key: "detail-summary-header",
    name: "MoveDetailSummaryHeader",
    path: "@/components/moves/detail/MoveDetailSummaryHeader",
    usedFor: "Operational summary header — lifecycle, snapshot, coordinator",
  },
  {
    key: "detail-main",
    name: "MoveDetailMain",
    path: "@/components/moves/detail/MoveDetailMain",
    usedFor: "Lifecycle tabs: overview, move plan, schedule, financial, etc.",
  },
  {
    key: "detail-activity-sidebar",
    name: "MoveDetailActivitySidebar",
    path: "@/components/moves/detail/MoveDetailActivitySidebar",
    usedFor: "Unified activity feed + quick actions",
  },
] as const;

export { MOVE_DETAIL_MAIN_TABS } from "@/lib/moves/detail-layout";
export { getMoveQuickActions, MOVE_QUICK_ACTIONS } from "@/lib/moves/quick-actions";
export type { MoveDetailMainTabId } from "@/lib/moves/detail-layout";
export type { MoveQuickActionId } from "@/lib/moves/quick-actions";
