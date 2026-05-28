/** @deprecated Import from `@/lib/moves/move-pipeline` instead. */
export {
  emphasizedSections,
  getPipelinePhase as getLifecyclePhase,
  getPipelineStage,
  getPipelineStage as getLifecycleStage,
  getPrimaryWorkspaceMode,
  hasConfirmedJobDays,
  hasProposedJobDays,
  MOVES_PIPELINE_STAGES as LIFECYCLE_PIPELINE_STAGES,
  pipelineStageConfig as lifecycleStageConfig,
  pipelineStageIndex as lifecycleStageIndex,
  pipelineStageLabel as lifecycleStageLabel,
  PIPELINE_STAGES as LIFECYCLE_STAGES,
  primaryWorkspaceTitle,
  type MoveDetailSectionId,
  type PipelinePhase as LifecyclePhase,
  type PrimaryWorkspaceMode,
} from "./move-pipeline";

export type { PipelineStageId as LifecycleStageId } from "./types";
