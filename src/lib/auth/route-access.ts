import type { Capability } from "@/lib/auth/capabilities";

/** Client-side path → capability (UI-only guard until middleware + Supabase). */
export function requiredCapabilityForPath(pathname: string): Capability | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "nav.dashboard";
  }
  if (pathname === "/calendar" || pathname.startsWith("/calendar/")) {
    return "nav.calendar";
  }
  if (pathname === "/schedule" || pathname.startsWith("/schedule/")) {
    return "nav.schedule";
  }
  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) {
    return "nav.inbox";
  }
  if (pathname.startsWith("/sales")) {
    return "nav.sales";
  }
  if (pathname === "/operations/payroll" || pathname.startsWith("/operations/payroll/")) {
    return "nav.payroll";
  }
  if (pathname.startsWith("/operations/reports")) {
    return "nav.reports";
  }
  if (pathname.startsWith("/operations")) {
    return "nav.operations";
  }
  if (pathname === "/planning" || pathname.startsWith("/planning/")) {
    return "nav.planning";
  }
  if (pathname.startsWith("/admin")) {
    return "nav.admin";
  }
  return null;
}

export function fallbackPathForCapabilities(
  has: (cap: Capability) => boolean,
): string {
  if (has("nav.dashboard")) return "/dashboard";
  if (has("nav.sales")) return "/sales/moves";
  if (has("nav.operations")) return "/operations/jobs";
  if (has("nav.payroll")) return "/operations/payroll";
  if (has("app.crew")) return "/crew";
  return "/sign-in";
}
