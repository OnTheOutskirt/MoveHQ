import type { FlatRateIntake, PackingService } from "@/lib/moves/flat-rate-intake";

export const INTAKE_SERVICE_OPTIONS = [
  { value: "moving", label: "Moving" },
  { value: "full-pack", label: "Full pack" },
  { value: "partial-pack", label: "Partial pack" },
  { value: "client-packs", label: "Client packs (furniture only)" },
  { value: "junk", label: "Junk removal" },
  { value: "pack-only", label: "Pack only" },
  { value: "unpack", label: "Unpack" },
] as const;

export type IntakeServiceId = (typeof INTAKE_SERVICE_OPTIONS)[number]["value"];

/** Dedupe and drop unknown ids while preserving order. */
export function normalizeServiceIds(selected: IntakeServiceId[]): IntakeServiceId[] {
  const seen = new Set<IntakeServiceId>();
  const out: IntakeServiceId[] = [];
  for (const id of selected) {
    if (!INTAKE_SERVICE_OPTIONS.some((o) => o.value === id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Infer checkboxes from legacy intake fields (moves not yet saved via Services needed). */
export function deriveSelectedServicesFromLegacy(intake: FlatRateIntake): IntakeServiceId[] {
  const selected: IntakeServiceId[] = [];

  if (intake.jobType === "pack-only") {
    selected.push("pack-only");
    if (intake.hasJunk) selected.push("junk");
    return selected;
  }
  if (intake.jobType === "unpack-only") {
    selected.push("unpack");
    return selected;
  }
  if (intake.jobType === "junk" && !intake.packingService) {
    selected.push("junk");
    return selected;
  }

  if (
    !["pack-only", "unpack-only", "junk", "load-unload-only", "in-facility"].includes(
      intake.jobType,
    )
  ) {
    selected.push("moving");
  }

  if (intake.packingService === "full") selected.push("full-pack");
  if (intake.packingService === "partial") selected.push("partial-pack");
  if (intake.packingService === "self-move") selected.push("client-packs");
  if (intake.hasJunk) selected.push("junk");

  return [...new Set(selected)];
}

export function deriveSelectedServices(intake: FlatRateIntake): IntakeServiceId[] {
  if (intake.servicesNeeded != null) {
    return normalizeServiceIds(intake.servicesNeeded);
  }
  return deriveSelectedServicesFromLegacy(intake);
}

export function formatSelectedServicesLabel(ids: IntakeServiceId[]): string {
  if (ids.length === 0) return "—";
  return ids
    .map((id) => INTAKE_SERVICE_OPTIONS.find((o) => o.value === id)?.label ?? id)
    .join(", ");
}

/** Map multi-select to intake fields (packing options are mutually exclusive). */
export function applySelectedServices(selected: IntakeServiceId[]): Partial<FlatRateIntake> {
  const ids = normalizeServiceIds(selected);
  const has = (id: IntakeServiceId) => ids.includes(id);

  if (has("pack-only")) {
    return {
      servicesNeeded: ids,
      jobType: "pack-only",
      hasJunk: has("junk"),
      packingService: "none",
    };
  }

  if (has("unpack") && !has("moving")) {
    return {
      servicesNeeded: ids,
      jobType: "unpack-only",
      hasJunk: has("junk"),
      packingService: "none",
    };
  }

  let packingService: PackingService = "none";
  if (has("full-pack")) packingService = "full";
  else if (has("partial-pack")) packingService = "partial";
  else if (has("client-packs")) packingService = "self-move";

  const onlyJunk =
    has("junk") &&
    !has("moving") &&
    !has("full-pack") &&
    !has("partial-pack") &&
    !has("client-packs");

  return {
    servicesNeeded: ids,
    jobType: onlyJunk ? "junk" : "standard",
    hasJunk: has("junk"),
    packingService,
  };
}
