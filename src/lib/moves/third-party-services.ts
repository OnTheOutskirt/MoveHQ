import type { IntakeThirdPartyService } from "./flat-rate-intake";
import { catalogVendorTypeLabel } from "@/lib/settings/field-catalog-runtime";

/** Legacy equipment-tab service ids → Setup vendor type ids. */
const LEGACY_SERVICE_TO_VENDOR_TYPE: Record<string, string> = {
  crating: "special_services",
  piano: "special_services",
  appliance: "special_services",
  junk: "special_services",
  storage: "operations_materials",
  cleaning: "special_services",
  other: "special_services",
};

export function normalizeThirdPartyVendorTypeId(serviceTypeId: string): string {
  return LEGACY_SERVICE_TO_VENDOR_TYPE[serviceTypeId] ?? serviceTypeId;
}

export function newThirdPartyServiceId(): string {
  return `tps-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function thirdPartyVendorTypeLabel(line: IntakeThirdPartyService): string {
  const typeId = normalizeThirdPartyVendorTypeId(line.serviceTypeId);
  if (line.serviceTypeId === "other" && line.customLabel?.trim()) {
    return line.customLabel.trim();
  }
  return catalogVendorTypeLabel(typeId);
}

/** @deprecated Use thirdPartyVendorTypeLabel */
export function thirdPartyServiceLabel(line: IntakeThirdPartyService): string {
  return thirdPartyVendorTypeLabel(line);
}

export function normalizeThirdPartyServices(
  raw: IntakeThirdPartyService[] | undefined,
): IntakeThirdPartyService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((line) => line.serviceTypeId)
    .map((line) => ({
      ...line,
      serviceTypeId: normalizeThirdPartyVendorTypeId(line.serviceTypeId),
    }));
}
