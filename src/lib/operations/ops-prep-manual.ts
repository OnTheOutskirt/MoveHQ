import type { OpsPrepCategory } from "./ops-prep-tasks";

/** Map setup vendor type → ops prep list icon grouping. */
export function opsPrepCategoryForVendorType(vendorTypeId: string): OpsPrepCategory {
  switch (vendorTypeId) {
    case "operations_materials":
      return "materials";
    case "truck_fleet":
    case "fleet_repair":
      return "logistics";
    case "hr_vendors":
      return "coordination";
    default:
      return "vendor";
  }
}

export function legacyCategoryToVendorTypeId(category: OpsPrepCategory): string {
  switch (category) {
    case "materials":
      return "operations_materials";
    case "logistics":
      return "truck_fleet";
    case "coordination":
      return "hr_vendors";
    default:
      return "special_services";
  }
}

export const MANUAL_OPS_PREP_NO_MOVE_LABEL = "General prep";
