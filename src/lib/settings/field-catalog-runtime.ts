import type { LostQualification } from "@/lib/moves/lost-reasons-constants";
import type { PipelineStageStyle } from "./field-catalog-types";
import { defaultFieldCatalog, normalizeFieldCatalog } from "./field-catalog-defaults";
import type { FieldCatalogEntry, FieldCatalogSettings } from "./field-catalog-types";

let runtimeCatalog: FieldCatalogSettings = defaultFieldCatalog();

export function syncFieldCatalogRuntime(catalog: FieldCatalogSettings): void {
  runtimeCatalog = normalizeFieldCatalog(catalog);
}

export function getFieldCatalogRuntime(): FieldCatalogSettings {
  return runtimeCatalog;
}

function findEntry(group: keyof FieldCatalogSettings, id: string): FieldCatalogEntry | undefined {
  return runtimeCatalog[group].find((e) => e.id === id);
}

export function catalogPipelineStageLabel(id: string): string {
  const entry = findEntry("pipelineStages", id);
  return entry?.label ?? id;
}

export function catalogMoveDetailPipelineStageLabel(id: string): string {
  const entry = findEntry("pipelineStages", id);
  return entry?.detailLabel ?? entry?.label ?? id;
}

export function catalogPipelineStageStyle(id: string): PipelineStageStyle {
  const entry = findEntry("pipelineStages", id);
  return {
    label: entry?.label ?? id,
    description: entry?.description ?? "",
    badge: entry?.badgeClass ?? "bg-slate-100 text-slate-700",
    column: entry?.columnClass ?? "border-slate-200 bg-slate-50/80",
    dot: entry?.dotClass ?? "bg-slate-400",
  };
}

export function catalogPipelineBoardStageIds(): string[] {
  return runtimeCatalog.pipelineStages.filter((s) => !s.hideFromBoard).map((s) => s.id);
}

export function catalogAllPipelineStageIds(): string[] {
  return runtimeCatalog.pipelineStages.map((s) => s.id);
}

export function catalogWaitingSubstageLabel(id: string): string {
  return findEntry("waitingSubstages", id)?.label ?? id;
}

export function catalogWaitingSubstageBadge(id: string): string {
  return findEntry("waitingSubstages", id)?.badgeClass ?? "bg-slate-100 text-slate-700";
}

export function catalogWaitingSubstageIds(): string[] {
  return runtimeCatalog.waitingSubstages.map((s) => s.id);
}

export function catalogConditionLabel(id: string): string {
  return findEntry("conditionStatuses", id)?.label ?? id;
}

export function catalogConditionBadge(id: string): string {
  return findEntry("conditionStatuses", id)?.badgeClass ?? "bg-slate-100 text-slate-600";
}

export function catalogLeadSourceLabel(id: string): string {
  return findEntry("leadSources", id)?.label ?? id.replace(/_/g, " ");
}

export function catalogLeadSourceIsHot(id: string): boolean {
  return findEntry("leadSources", id)?.isHot ?? false;
}

export function catalogMoveTypeLabel(idOrLabel: string): string {
  const byId = findEntry("moveTypes", idOrLabel);
  if (byId) return byId.label;
  const byLabel = runtimeCatalog.moveTypes.find((m) => m.label === idOrLabel);
  return byLabel?.label ?? idOrLabel;
}

export function catalogLostReasons(qualification: LostQualification) {
  return runtimeCatalog.lostReasons
    .filter((r) => r.qualification === qualification)
    .map((r) => ({ id: r.id, label: r.label, description: r.description }));
}

export function catalogFindLostReason(qualification: LostQualification, reasonId: string) {
  return catalogLostReasons(qualification).find((r) => r.id === reasonId);
}

export {
  catalogPriorityTierBadge,
  catalogPriorityTierConfig,
  catalogPriorityTierIds,
  catalogPriorityTierLabel,
} from "@/lib/settings/priority-tier-rules-runtime";

export function catalogHotLeadSourceIds(): string[] {
  return runtimeCatalog.leadSources.filter((s) => s.isHot).map((s) => s.id);
}

export function catalogLeadSourceIds(): string[] {
  return runtimeCatalog.leadSources.map((s) => s.id);
}

export function catalogMoveTypeLabels(): string[] {
  return runtimeCatalog.moveTypes.map((m) => m.label);
}

export function catalogReferralTypeEntries(): FieldCatalogEntry[] {
  return runtimeCatalog.referralTypes;
}

export function catalogVendorTypeEntries(): FieldCatalogEntry[] {
  return runtimeCatalog.vendorTypes;
}

export function catalogReferralTypeLabel(id: string): string {
  return findEntry("referralTypes", id)?.label ?? id.replace(/_/g, " ");
}

export function catalogReferralTypeBadge(id: string): string {
  return findEntry("referralTypes", id)?.badgeClass ?? "bg-slate-100 text-slate-700";
}

export function catalogVendorTypeLabel(id: string): string {
  return findEntry("vendorTypes", id)?.label ?? id.replace(/_/g, " ");
}

export function catalogVendorTypeBadge(id: string): string {
  return findEntry("vendorTypes", id)?.badgeClass ?? "bg-violet-50 text-violet-800";
}
