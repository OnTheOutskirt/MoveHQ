import {
  equipmentLineLabel,
  getEquipmentCatalogItem,
  normalizeEquipmentSupplies,
} from "@/lib/moves/equipment-supplies";
import {
  normalizeThirdPartyServices,
  thirdPartyServiceLabel,
} from "@/lib/moves/third-party-services";
import { resolveVendorDirectoryLabel } from "@/lib/people/vendors";
import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import { PACKING_SERVICE_LABELS } from "@/lib/moves/flat-rate-intake";

export type OpsSupplyLine = { label: string; quantity: number; priceNote: string };

export function opsSupplyLines(intake: FlatRateIntake): {
  supplies: OpsSupplyLine[];
  equipment: OpsSupplyLine[];
} {
  const lines = normalizeEquipmentSupplies(intake);
  const supplies: OpsSupplyLine[] = [];
  const equipment: OpsSupplyLine[] = [];

  for (const line of lines) {
    const item = getEquipmentCatalogItem(line.catalogId);
    if (!item || line.quantity <= 0) continue;
    const entry: OpsSupplyLine = {
      label: equipmentLineLabel(line),
      quantity: line.quantity,
      priceNote:
        item.unitPrice > 0 ? `$${item.unitPrice}/${item.unit}` : "Included / no charge",
    };
    if (item.category === "supply") supplies.push(entry);
    else equipment.push(entry);
  }

  return { supplies, equipment };
}

export function opsThirdPartyLines(intake: FlatRateIntake) {
  return normalizeThirdPartyServices(intake.thirdPartyServices).map((line) => ({
    service: thirdPartyServiceLabel(line),
    vendor: resolveVendorDirectoryLabel(line.vendorDirectoryId) || "Vendor TBD",
    notes: line.notes?.trim() || null,
    cost:
      line.estimatedCost != null && line.estimatedCost > 0
        ? `$${line.estimatedCost.toLocaleString()}`
        : null,
  }));
}

export function opsPackingNote(intake: FlatRateIntake): string | null {
  if (intake.packingService === "full") return "Full pack scheduled";
  if (intake.packingService === "partial") {
    const rooms = intake.partialPackRooms?.length
      ? intake.partialPackRooms.join(", ")
      : "selected rooms";
    return `Partial pack — ${rooms}`;
  }
  if (intake.packingService === "none") return null;
  return PACKING_SERVICE_LABELS[intake.packingService] ?? intake.packingService;
}
