import type { PermissionLevel } from "@/lib/team/types";
import type { DashboardView } from "./types";

/**
 * Which dashboard a signed-in user should land on (production).
 * Preview tabs on /dashboard override this for now.
 */
export function dashboardViewForPermission(level: PermissionLevel): DashboardView {
  switch (level) {
    case "admin":
      return "executive";
    case "manager":
      return "sales";
    case "sales":
      return "sales";
    case "operations":
    case "crew":
      return "ops";
    default:
      return "sales";
  }
}
