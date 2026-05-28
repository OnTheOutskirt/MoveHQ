import {
  INTAKE_HEAR_ABOUT,
  INTAKE_HEAR_ABOUT_LABELS,
  INTAKE_JOB_TYPES,
  INTAKE_JOB_TYPE_LABELS,
  INTAKE_LOCATION_TYPES,
  INTAKE_LOCATION_LABELS,
  PACKING_DENSITY,
  PACKING_SERVICE,
  PACKING_SERVICE_LABELS,
} from "@/lib/moves/flat-rate-intake";
import { packingDensityLabel } from "@/lib/moves/intake-display";

export const EMPTY_SELECT = { value: "", label: "—" };

export function intakeSelectOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): { value: string; label: string }[] {
  return [EMPTY_SELECT, ...values.map((v) => ({ value: v, label: labels[v] ?? v }))];
}

export const jobTypeOptions = intakeSelectOptions(INTAKE_JOB_TYPES, INTAKE_JOB_TYPE_LABELS);
export const hearAboutOptions = intakeSelectOptions(INTAKE_HEAR_ABOUT, INTAKE_HEAR_ABOUT_LABELS);
export const locationTypeOptions = intakeSelectOptions(
  INTAKE_LOCATION_TYPES,
  INTAKE_LOCATION_LABELS,
);
export const packingDensityOptions = [
  EMPTY_SELECT,
  ...PACKING_DENSITY.map((v) => ({ value: v, label: packingDensityLabel(v) })),
];
export const packingServiceOptions = intakeSelectOptions(PACKING_SERVICE, PACKING_SERVICE_LABELS);

export const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const loadUnloadDirectionOptions = [
  { value: "loading", label: "Loading" },
  { value: "unloading", label: "Unloading" },
];

export function yesNoValue(flag: boolean): string {
  return flag ? "yes" : "no";
}

export function parseYesNo(value: string): boolean {
  return value === "yes";
}
