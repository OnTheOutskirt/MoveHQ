/** @deprecated Import from `@/lib/moves/move-pipeline` instead. */
export {
  isFollowUpOverdue,
  moveNeedsFollowUp,
  pipelineStageConfig as salesStageConfig,
  pipelineStageLabel as salesStageLabel,
  MOVES_PIPELINE_STAGES as SALES_PIPELINE_STAGES,
} from "./move-pipeline";

export type { PipelineStageId as SalesStageId } from "./types";
