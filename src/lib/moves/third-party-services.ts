import type { IntakeThirdPartyService } from "./flat-rate-intake";

export type ThirdPartyServiceType = {
  id: string;
  label: string;
  hint?: string;
};

export const THIRD_PARTY_SERVICE_TYPES: ThirdPartyServiceType[] = [
  { id: "crating", label: "Crating", hint: "Custom wood crating for art, marble, etc." },
  { id: "piano", label: "Piano / specialty moving" },
  { id: "appliance", label: "Appliance disconnect / reconnect" },
  { id: "junk", label: "Junk haul-off" },
  { id: "storage", label: "Portable storage / POD" },
  { id: "cleaning", label: "Post-move cleaning" },
  { id: "other", label: "Other" },
];

export function newThirdPartyServiceId(): string {
  return `tps-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function thirdPartyServiceLabel(line: IntakeThirdPartyService): string {
  const preset = THIRD_PARTY_SERVICE_TYPES.find((t) => t.id === line.serviceTypeId);
  if (line.serviceTypeId === "other" && line.customLabel?.trim()) {
    return line.customLabel.trim();
  }
  return preset?.label ?? line.serviceTypeId;
}

export function normalizeThirdPartyServices(
  raw: IntakeThirdPartyService[] | undefined,
): IntakeThirdPartyService[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((line) => line.serviceTypeId);
}
