import { DEFAULT_EQUIPMENT_SUPPLY_CATALOG } from "./equipment-catalog-defaults";
import type { EquipmentCatalogCategory, EquipmentCatalogItem } from "./equipment-catalog-types";

const STORAGE_KEY = "jm-equipment-supplies-catalog";

export const EQUIPMENT_CATALOG_UPDATED_EVENT = "jm-equipment-catalog-updated";

function normalizeItem(raw: unknown): EquipmentCatalogItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<EquipmentCatalogItem>;
  if (!item.id || !item.label) return null;
  const category: EquipmentCatalogCategory =
    item.category === "equipment" ? "equipment" : "supply";
  return {
    id: item.id,
    label: item.label.trim(),
    unit: typeof item.unit === "string" && item.unit.trim() ? item.unit.trim() : "ea",
    unitPrice: typeof item.unitPrice === "number" && item.unitPrice >= 0 ? item.unitPrice : 0,
    category,
    showOnQuote: item.showOnQuote === true,
    showOnContract: item.showOnContract === true,
  };
}

export function normalizeEquipmentCatalog(raw: unknown): EquipmentCatalogItem[] {
  if (!Array.isArray(raw)) return [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
  const items = raw.map(normalizeItem).filter((x): x is EquipmentCatalogItem => x != null);
  return items.length > 0 ? items : [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
}

export function loadEquipmentCatalog(): EquipmentCatalogItem[] {
  if (typeof window === "undefined") return [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
    return normalizeEquipmentCatalog(JSON.parse(raw));
  } catch {
    return [...DEFAULT_EQUIPMENT_SUPPLY_CATALOG];
  }
}

export function saveEquipmentCatalog(catalog: EquipmentCatalogItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  window.dispatchEvent(new Event(EQUIPMENT_CATALOG_UPDATED_EVENT));
}

export function catalogSnapshot(catalog: EquipmentCatalogItem[]): string {
  return JSON.stringify(catalog);
}

export function generateEquipmentCatalogId(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
  return `${base || "item"}_${Date.now().toString(36).slice(-5)}`;
}
