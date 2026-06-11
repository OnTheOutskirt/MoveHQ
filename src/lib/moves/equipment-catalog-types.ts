export type EquipmentCatalogCategory = "supply" | "equipment";

export type EquipmentCatalogItem = {
  id: string;
  label: string;
  unit: string;
  unitPrice: number;
  category: EquipmentCatalogCategory;
  showOnQuote: boolean;
  showOnContract: boolean;
};
