import { defaultFieldCatalog, normalizeFieldCatalog } from "./field-catalog-defaults";
import {
  normalizeOpenDays,
  normalizeWeekStartsOn,
} from "@/lib/settings/business-calendar";
import { defaultPipelineCopySettings } from "@/lib/settings/pipeline-copy";
import { normalizePipelineAutomations } from "@/lib/settings/pipeline-automation-rules";
import { normalizeLeadRoutingRules } from "@/lib/settings/lead-routing-rules";
import { normalizeMoveTypeRules } from "@/lib/settings/move-type-rules";
import { normalizeOpsPrepRules } from "@/lib/settings/ops-prep-rules";
import { normalizePriorityTierRules } from "@/lib/settings/priority-tier-rules";
import { normalizeTerminology } from "@/lib/terminology/normalize";
import { defaultCrewDepartureTime24 } from "@/lib/moves/crew-departure";
import {
  defaultFollowOnArrivalEndTime24,
  defaultFollowOnArrivalStartTime24,
  FALLBACK_ARRIVAL_WINDOW_MINUTES,
  FALLBACK_DEPOT_DRIVE_MINUTES,
} from "@/lib/moves/job-day-arrival";
import { normalizeGoogleReviewMinStars } from "@/lib/moves/move-feedback-portal";
import { defaultSettings } from "./defaults";
import type { AppSettings, CompanySettings, DefaultsSettings, DepositDefaultMode } from "./types";

type LegacyDefaults = DefaultsSettings & {
  depositPercent?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
};

function normalizeArrivalWindowMinutes(raw: number | undefined): 30 | 45 | 60 {
  if (raw === 30 || raw === 45 || raw === 60) return raw;
  return FALLBACK_ARRIVAL_WINDOW_MINUTES;
}

function normalizeDepotDriveMinutes(raw: number | undefined): number {
  if (typeof raw === "number" && raw >= 10 && raw <= 180) return raw;
  return FALLBACK_DEPOT_DRIVE_MINUTES;
}

function normalizeDepositDefaults(raw: LegacyDefaults | undefined): DefaultsSettings {
  const base = { ...defaultSettings.defaults, ...raw };
  const defaultCrewDepartureTime = defaultCrewDepartureTime24(base);
  const defaultCustomerArrivalWindowMinutes = normalizeArrivalWindowMinutes(
    base.defaultCustomerArrivalWindowMinutes,
  );
  const defaultDepotToJobDriveMinutes = normalizeDepotDriveMinutes(
    base.defaultDepotToJobDriveMinutes,
  );
  const schedulingDefaults = {
    defaultCrewDepartureTime,
    defaultCustomerArrivalWindowMinutes,
    defaultDepotToJobDriveMinutes,
    defaultFollowOnArrivalStartTime: defaultFollowOnArrivalStartTime24(base),
    defaultFollowOnArrivalEndTime: defaultFollowOnArrivalEndTime24(base),
    postMoveGoogleReviewMinStars: normalizeGoogleReviewMinStars(
      base.postMoveGoogleReviewMinStars,
    ),
  };
  if (raw?.depositMode === "percent" || raw?.depositMode === "fixed") {
    return {
      depositMode: raw.depositMode,
      depositValue: Number.isFinite(raw.depositValue) ? raw.depositValue : defaultSettings.defaults.depositValue,
      quoteValidityDays: base.quoteValidityDays,
      defaultPricingType: base.defaultPricingType,
      flatRateInventoryBasis:
        base.flatRateInventoryBasis === "weight" ? "weight" : "cubic_feet",
      hourlyNotToExceedAmount: Number.isFinite(base.hourlyNotToExceedAmount)
        ? base.hourlyNotToExceedAmount
        : defaultSettings.defaults.hourlyNotToExceedAmount,
      ...schedulingDefaults,
    };
  }
  if (typeof raw?.depositPercent === "number") {
    return {
      ...base,
      depositMode: "percent",
      depositValue: raw.depositPercent,
      ...schedulingDefaults,
    };
  }
  return { ...base, ...schedulingDefaults };
}

function normalizeCompany(
  raw: Partial<CompanySettings> | undefined,
  legacyDefaults: LegacyDefaults | undefined,
): CompanySettings {
  return {
    ...defaultSettings.company,
    ...raw,
    businessHoursStart:
      raw?.businessHoursStart ??
      legacyDefaults?.businessHoursStart ??
      defaultSettings.company.businessHoursStart,
    businessHoursEnd:
      raw?.businessHoursEnd ??
      legacyDefaults?.businessHoursEnd ??
      defaultSettings.company.businessHoursEnd,
    weekStartsOn: normalizeWeekStartsOn(raw?.weekStartsOn ?? defaultSettings.company.weekStartsOn),
    openDays: normalizeOpenDays(raw?.openDays),
  };
}

export function normalizeAppSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  if (!raw) return defaultSettings;
  const legacyDefaults = raw.defaults as LegacyDefaults | undefined;
  const fieldCatalog = normalizeFieldCatalog(raw.fieldCatalog);
  return {
    branding: { ...defaultSettings.branding, ...raw.branding },
    company: normalizeCompany(raw.company, legacyDefaults),
    defaults: normalizeDepositDefaults(legacyDefaults),
    terminology: normalizeTerminology(raw.terminology),
    automations: { ...defaultSettings.automations, ...raw.automations },
    followUps: { ...defaultSettings.followUps, ...raw.followUps },
    pipelineCopy: {
      byStage: {
        ...defaultPipelineCopySettings().byStage,
        ...raw.pipelineCopy?.byStage,
      },
      waitingBySubstage: {
        ...defaultPipelineCopySettings().waitingBySubstage,
        ...raw.pipelineCopy?.waitingBySubstage,
      },
    },
    fieldCatalog,
    priorityTierRules: normalizePriorityTierRules(raw.priorityTierRules, fieldCatalog),
    pipelineAutomations: normalizePipelineAutomations(raw.pipelineAutomations),
    leadRouting: normalizeLeadRoutingRules(raw.leadRouting),
    moveTypeRules: normalizeMoveTypeRules(raw.moveTypeRules),
    opsPrepRules: normalizeOpsPrepRules(raw.opsPrepRules, fieldCatalog.vendorTypes),
  };
}

export function formatDefaultDepositLabel(
  mode: DepositDefaultMode,
  value: number,
): string {
  if (mode === "fixed") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${value}%`;
}
