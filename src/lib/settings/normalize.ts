import { defaultFieldCatalog, normalizeFieldCatalog } from "./field-catalog-defaults";
import { defaultPipelineCopySettings } from "@/lib/settings/pipeline-copy";
import { normalizeTerminology } from "@/lib/terminology/normalize";
import { defaultSettings } from "./defaults";
import type { AppSettings, CompanySettings, DefaultsSettings, DepositDefaultMode } from "./types";

type LegacyDefaults = DefaultsSettings & {
  depositPercent?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
};

function normalizeDepositDefaults(raw: LegacyDefaults | undefined): DefaultsSettings {
  const base = { ...defaultSettings.defaults, ...raw };
  if (raw?.depositMode === "percent" || raw?.depositMode === "fixed") {
    return {
      depositMode: raw.depositMode,
      depositValue: Number.isFinite(raw.depositValue) ? raw.depositValue : defaultSettings.defaults.depositValue,
      quoteValidityDays: base.quoteValidityDays,
      defaultPricingType: base.defaultPricingType,
    };
  }
  if (typeof raw?.depositPercent === "number") {
    return {
      ...base,
      depositMode: "percent",
      depositValue: raw.depositPercent,
    };
  }
  return base;
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
  };
}

export function normalizeAppSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  if (!raw) return defaultSettings;
  const legacyDefaults = raw.defaults as LegacyDefaults | undefined;
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
    fieldCatalog: normalizeFieldCatalog(raw.fieldCatalog),
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
