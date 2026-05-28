/** @deprecated Import from `@/lib/moves/move-priority-tier` */
export {
  computePriorityTier as computeQuadrant,
  getMoveEstimatedValue,
  getMovePriorityTier as getMoveQuadrant,
  getMoveValueTier,
  heatValueSummary,
  isHotLeadChannel,
  leadChannelFromHearAbout,
  leadChannelFromLegacySource,
  leadChannelLabels,
  leadHeatFromChannel,
  leadHeatLabel,
  PRIORITY_TIER_IDS as QUADRANT_IDS,
  priorityTierConfig as quadrantConfig,
  priorityTierLabel,
  priorityTierSortOrder as quadrantSortPriority,
  shouldAutomateFollowUp,
  VALUE_THRESHOLD,
  valueTierFromAmount,
  valueTierLabel,
} from "./move-priority-tier";

export type { PriorityTierId as QuadrantId } from "./move-priority-tier";
