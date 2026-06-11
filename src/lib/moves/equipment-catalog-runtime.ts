import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "./equipment-catalog-defaults";
import type { EquipmentCatalogItem } from "./equipment-catalog-types";

let runtimeCatalog: EquipmentCatalogItem[] = [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];

export function setEquipmentCatalogRuntime(catalog: EquipmentCatalogItem[]): void {
  runtimeCatalog = catalog.length > 0 ? catalog : [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
}

export function getEquipmentCatalog(): EquipmentCatalogItem[] {
  return runtimeCatalog;
}

export function getEquipmentCatalogById(): Map<string, EquipmentCatalogItem> {
  return new Map(runtimeCatalog.map((item) => [item.id, item]));
}
