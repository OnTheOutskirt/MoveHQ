import type { Capability, CapabilitySet } from "@/lib/auth/capabilities";
import type { NavDropdown, NavEntry, NavLink } from "@/lib/tokens/navigation";

function linkCapability(href: string): Capability | null {
  if (href === "/dashboard") return "nav.dashboard";
  if (href === "/calendar") return "nav.calendar";
  if (href === "/schedule") return "nav.schedule";
  if (href === "/inbox") return "nav.inbox";
  if (href.startsWith("/sales")) return "nav.sales";
  if (href === "/operations/payroll") return "nav.payroll";
  if (href.startsWith("/operations/reports")) return "nav.reports";
  if (href.startsWith("/operations")) return "nav.operations";
  if (href === "/planning") return "nav.planning";
  if (href.startsWith("/admin")) return "nav.admin";
  return null;
}

function filterLink(link: NavLink, caps: CapabilitySet): NavLink | null {
  const required = linkCapability(link.href);
  if (required && !caps.has(required)) return null;
  return link;
}

export function filterNavigation(entries: NavEntry[], caps: CapabilitySet): NavEntry[] {
  const result: NavEntry[] = [];

  for (const entry of entries) {
    if (entry.type === "link") {
      const link = filterLink(entry, caps);
      if (link) result.push(link);
      continue;
    }

    const items = entry.items
      .map((item) => filterLink(item, caps))
      .filter((item): item is NavLink => item != null);

    if (items.length === 0) continue;

    const dropdown: NavDropdown = { ...entry, items };
    result.push(dropdown);
  }

  return result;
}
