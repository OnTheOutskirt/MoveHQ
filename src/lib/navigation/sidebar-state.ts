import { navigation, type NavDropdown, type NavEntry } from "@/lib/tokens/navigation";

const OPEN_DROPDOWN_KEY = "jm-sidebar-open-dropdown";

export function readOpenSidebarDropdown(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(OPEN_DROPDOWN_KEY);
  } catch {
    return null;
  }
}

export function writeOpenSidebarDropdown(label: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (label === null) {
      localStorage.removeItem(OPEN_DROPDOWN_KEY);
    } else {
      localStorage.setItem(OPEN_DROPDOWN_KEY, label);
    }
  } catch {
    /* ignore */
  }
}

export function isDropdownActive(dropdown: NavDropdown, pathname: string): boolean {
  return dropdown.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export function findActiveDropdown(pathname: string): NavDropdown | undefined {
  for (const entry of navigation) {
    if (entry.type === "dropdown" && isDropdownActive(entry, pathname)) {
      return entry;
    }
  }
  return undefined;
}

export function isValidDropdownLabel(label: string): boolean {
  return navigation.some((e) => e.type === "dropdown" && e.label === label);
}

export function getDropdownEntries(): NavEntry[] {
  return navigation.filter((e): e is NavDropdown => e.type === "dropdown");
}
