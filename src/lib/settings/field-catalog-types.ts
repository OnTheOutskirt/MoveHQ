import type { LostQualification } from "@/lib/moves/lost-reasons-constants";

export type PipelineStageStyle = {
  label: string;
  description: string;
  badge: string;
  column: string;
  dot: string;
};

export type FieldCatalogEntry = {
  id: string;
  label: string;
  description?: string;
  badgeClass?: string;
  /** System-provided — label/description editable; cannot remove. */
  builtIn?: boolean;
  /** Pipeline stage: omit from /moves kanban (e.g. completed). */
  hideFromBoard?: boolean;
  /** Lead source: counts toward hot priority tier. */
  isHot?: boolean;
  /** Lost reason grouping. */
  qualification?: LostQualification;
  /** Priority tier short code (Q1, etc.). */
  shortCode?: string;
  meaning?: string;
  /** Pipeline board column styling. */
  columnClass?: string;
  dotClass?: string;
  /** Move detail stepper label override. */
  detailLabel?: string;
};

export type FieldCatalogSettings = {
  pipelineStages: FieldCatalogEntry[];
  waitingSubstages: FieldCatalogEntry[];
  conditionStatuses: FieldCatalogEntry[];
  leadSources: FieldCatalogEntry[];
  moveTypes: FieldCatalogEntry[];
  priorityTiers: FieldCatalogEntry[];
  lostReasons: FieldCatalogEntry[];
};

export type FieldCatalogGroup = keyof FieldCatalogSettings;
