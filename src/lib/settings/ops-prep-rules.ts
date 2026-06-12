import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";

export type OpsPrepDueAnchor = "job_day" | "first_job_day";

export type OpsPrepBuiltinRuleId =
  | "timing_hotel_notes"
  | "long_distance_hotel"
  | "storage"
  | "specialty_vendor"
  | "appliance_referral"
  | "packing_materials"
  | "large_inventory_supplies"
  | "coi"
  | "linehaul_trailer";

export type OpsPrepVendorTypeRule = {
  vendorTypeId: string;
  enabled: boolean;
  daysBefore: number;
  anchor: OpsPrepDueAnchor;
};

export type OpsPrepBuiltinRule = {
  id: OpsPrepBuiltinRuleId;
  enabled: boolean;
  daysBefore: number;
  anchor: OpsPrepDueAnchor;
};

export type OpsPrepJobDayHotelRule = {
  enabled: boolean;
  /** 0 = due on the job day itself */
  daysBefore: number;
};

export type CrewLodgingSettings = {
  /** Client charge per room per night */
  roomRatePerNight: number;
  /** Client charge per mover per night (per diem) */
  perDiemPerMover: number;
  /** Crew size ÷ this value, rounded up = room count */
  moversPerRoom: number;
};

export type OpsPrepRulesSettings = {
  jobDayHotel: OpsPrepJobDayHotelRule;
  vendorTypes: OpsPrepVendorTypeRule[];
  builtIn: OpsPrepBuiltinRule[];
  crewLodging: CrewLodgingSettings;
};

export const OPS_PREP_BUILTIN_RULE_LABELS: Record<
  OpsPrepBuiltinRuleId,
  { label: string; description: string }
> = {
  timing_hotel_notes: {
    label: "Hotel in timing notes",
    description: "Timing notes mention hotel, lodging, or overnight",
  },
  long_distance_hotel: {
    label: "Long-distance multi-day",
    description: "Long distance move with 2+ job days",
  },
  storage: {
    label: "Storage / vault",
    description: "Timing notes mention storage, vault, or SiteLink",
  },
  specialty_vendor: {
    label: "Specialty items (no vendor line)",
    description: "Specialty notes without a matching third-party service line",
  },
  appliance_referral: {
    label: "Appliance referral",
    description: "Disconnect/reconnect handled by outside vendor",
  },
  packing_materials: {
    label: "Packing materials",
    description: "Full or partial packing on the move",
  },
  large_inventory_supplies: {
    label: "Large inventory supplies",
    description: "120+ boxes with no packing service",
  },
  coi: {
    label: "Certificate of insurance",
    description: "COI required at origin or destination",
  },
  linehaul_trailer: {
    label: "Linehaul / trailer",
    description: "Job day truck summary mentions trailer or 53'",
  },
};

const DEFAULT_VENDOR_TYPE_DAYS: Record<string, { daysBefore: number; anchor: OpsPrepDueAnchor }> = {
  special_services: { daysBefore: 7, anchor: "first_job_day" },
};

function defaultVendorTypeRule(entry: FieldCatalogEntry): OpsPrepVendorTypeRule {
  const preset = DEFAULT_VENDOR_TYPE_DAYS[entry.id];
  return {
    vendorTypeId: entry.id,
    enabled: true,
    daysBefore: preset?.daysBefore ?? 5,
    anchor: preset?.anchor ?? "first_job_day",
  };
}

function defaultBuiltInRules(): OpsPrepBuiltinRule[] {
  return [
    { id: "timing_hotel_notes", enabled: true, daysBefore: 2, anchor: "job_day" },
    { id: "long_distance_hotel", enabled: true, daysBefore: 2, anchor: "job_day" },
    { id: "storage", enabled: true, daysBefore: 3, anchor: "first_job_day" },
    { id: "specialty_vendor", enabled: true, daysBefore: 5, anchor: "first_job_day" },
    { id: "appliance_referral", enabled: true, daysBefore: 4, anchor: "first_job_day" },
    { id: "packing_materials", enabled: true, daysBefore: 3, anchor: "first_job_day" },
    { id: "large_inventory_supplies", enabled: true, daysBefore: 2, anchor: "first_job_day" },
    { id: "coi", enabled: true, daysBefore: 5, anchor: "first_job_day" },
    { id: "linehaul_trailer", enabled: true, daysBefore: 4, anchor: "job_day" },
  ];
}

export function defaultCrewLodgingSettings(): CrewLodgingSettings {
  return {
    roomRatePerNight: 189,
    perDiemPerMover: 45,
    moversPerRoom: 2,
  };
}

export function defaultOpsPrepRules(vendorTypes: FieldCatalogEntry[] = []): OpsPrepRulesSettings {
  return {
    jobDayHotel: { enabled: true, daysBefore: 0 },
    vendorTypes: vendorTypes.map(defaultVendorTypeRule),
    builtIn: defaultBuiltInRules(),
    crewLodging: defaultCrewLodgingSettings(),
  };
}

function clampDaysBefore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(60, Math.round(value)));
}

function normalizeAnchor(value: unknown, fallback: OpsPrepDueAnchor): OpsPrepDueAnchor {
  return value === "job_day" || value === "first_job_day" ? value : fallback;
}

function normalizeCrewLodging(raw: Partial<CrewLodgingSettings> | undefined): CrewLodgingSettings {
  const base = defaultCrewLodgingSettings();
  return {
    roomRatePerNight:
      typeof raw?.roomRatePerNight === "number" && raw.roomRatePerNight >= 0
        ? Math.round(raw.roomRatePerNight)
        : base.roomRatePerNight,
    perDiemPerMover:
      typeof raw?.perDiemPerMover === "number" && raw.perDiemPerMover >= 0
        ? Math.round(raw.perDiemPerMover)
        : base.perDiemPerMover,
    moversPerRoom:
      typeof raw?.moversPerRoom === "number" && raw.moversPerRoom >= 1
        ? Math.round(raw.moversPerRoom)
        : base.moversPerRoom,
  };
}

export function normalizeOpsPrepRules(
  raw: Partial<OpsPrepRulesSettings> | undefined,
  vendorTypes: FieldCatalogEntry[],
): OpsPrepRulesSettings {
  const defaults = defaultOpsPrepRules(vendorTypes);
  const rawVendor = raw?.vendorTypes ?? [];
  const vendorById = new Map(rawVendor.map((rule) => [rule.vendorTypeId, rule]));

  return {
    jobDayHotel: {
      enabled: raw?.jobDayHotel?.enabled ?? defaults.jobDayHotel.enabled,
      daysBefore: clampDaysBefore(raw?.jobDayHotel?.daysBefore, defaults.jobDayHotel.daysBefore),
    },
    vendorTypes: vendorTypes.map((entry) => {
      const base = defaultVendorTypeRule(entry);
      const saved = vendorById.get(entry.id);
      if (!saved) return base;
      return {
        vendorTypeId: entry.id,
        enabled: saved.enabled ?? base.enabled,
        daysBefore: clampDaysBefore(saved.daysBefore, base.daysBefore),
        anchor: normalizeAnchor(saved.anchor, base.anchor),
      };
    }),
    builtIn: defaults.builtIn.map((base) => {
      const saved = raw?.builtIn?.find((rule) => rule.id === base.id);
      if (!saved) return base;
      return {
        id: base.id,
        enabled: saved.enabled ?? base.enabled,
        daysBefore: clampDaysBefore(saved.daysBefore, base.daysBefore),
        anchor: normalizeAnchor(saved.anchor, base.anchor),
      };
    }),
    crewLodging: normalizeCrewLodging(raw?.crewLodging),
  };
}

export function resolveOpsPrepBuiltinRule(
  rules: OpsPrepRulesSettings,
  id: OpsPrepBuiltinRuleId,
): OpsPrepBuiltinRule {
  return rules.builtIn.find((rule) => rule.id === id) ?? defaultBuiltInRules().find((r) => r.id === id)!;
}

export function resolveOpsPrepVendorTypeRule(
  rules: OpsPrepRulesSettings,
  vendorTypeId: string,
): OpsPrepVendorTypeRule {
  return (
    rules.vendorTypes.find((rule) => rule.vendorTypeId === vendorTypeId) ?? {
      vendorTypeId,
      enabled: true,
      daysBefore: 5,
      anchor: "first_job_day",
    }
  );
}
