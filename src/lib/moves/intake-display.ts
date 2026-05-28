import type { FlatRateIntake, IntakeAddress } from "./flat-rate-intake";
import {
  INTAKE_HEAR_ABOUT_LABELS,
  INTAKE_JOB_TYPE_LABELS,
  INTAKE_LOCATION_LABELS,
  PACKING_SERVICE_LABELS,
} from "./flat-rate-intake";

export function formatIntakeAddress(addr: IntakeAddress): string {
  const parts = [addr.street, addr.cityStateZip].filter(Boolean);
  return parts.join(", ") || "—";
}

export function formatAccessSummary(access: Record<string, string>): string {
  const entries = Object.entries(access).filter(([, v]) => v);
  if (entries.length === 0) return "—";
  return entries.map(([, v]) => v).join(" · ");
}

/** Multi-line `key: value` for inline access editing. */
export function formatAccessEditable(access: Record<string, string>): string {
  return Object.entries(access)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function parseAccessText(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) {
      result[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return result;
}

export function intakeJobTypeLabel(jobType: FlatRateIntake["jobType"]): string {
  return INTAKE_JOB_TYPE_LABELS[jobType] ?? jobType;
}

export function intakeHearAboutLabel(value: FlatRateIntake["hearAboutUs"]): string {
  if (!value) return "—";
  return INTAKE_HEAR_ABOUT_LABELS[value] ?? value;
}

export function intakeLocationLabel(type: IntakeAddress["locationType"]): string {
  if (!type) return "—";
  return INTAKE_LOCATION_LABELS[type] ?? type;
}

export function packingServiceLabel(service: FlatRateIntake["packingService"]): string {
  return PACKING_SERVICE_LABELS[service] ?? service;
}

export function packingDensityLabel(density: FlatRateIntake["packingDensity"]): string {
  const map: Record<string, string> = {
    light: "Less than average",
    avg: "About average",
    heavy: "More than average",
    custom: "Custom count",
  };
  return density ? (map[density] ?? density) : "—";
}

export function showsDestination(intake: FlatRateIntake): boolean {
  return !["pack-only", "in-facility", "in-home-rearrange", "junk"].includes(intake.jobType);
}

export function showsOrigin(intake: FlatRateIntake): boolean {
  return intake.jobType !== "unpack-only";
}
