"use client";

import { SidebarFollowUpsNav } from "@/components/layout/SidebarFollowUpsNav";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  findActiveDropdown,
  isDropdownActive,
  isValidDropdownLabel,
  readOpenSidebarDropdown,
  writeOpenSidebarDropdown,
} from "@/lib/navigation/sidebar-state";
import { navigation, type NavDropdown, type NavLink } from "@/lib/tokens/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function NavLinkItem({ item, pathname }: { item: NavLink; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function NavDropdownSection({
  dropdown,
  pathname,
  open,
  onToggle,
}: {
  dropdown: NavDropdown;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = dropdown.icon;
  const childActive = isDropdownActive(dropdown, pathname);

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          childActive ? "text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span className="flex-1 truncate text-left">{dropdown.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-white/10 pl-3">
          {dropdown.items.map((item) =>
            item.href === "/follow-ups" ? (
              <SidebarFollowUpsNav key={item.href} item={item} />
            ) : (
              <NavLinkItem key={item.href} item={item} pathname={pathname} />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { settings, isReady } = useSettings();
  const { branding } = settings;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [navReady, setNavReady] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const active = findActiveDropdown(pathname);
    if (active) {
      setOpenDropdown(active.label);
      writeOpenSidebarDropdown(active.label);
    } else {
      const stored = readOpenSidebarDropdown();
      if (stored && isValidDropdownLabel(stored)) {
        setOpenDropdown(stored);
      }
    }
    setNavReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once at mount
  }, []);

  const setOpenDropdownPersisted = useCallback((label: string | null) => {
    setOpenDropdown(label);
    writeOpenSidebarDropdown(label);
  }, []);

  const handleDropdownToggle = useCallback(
    (label: string) => {
      setOpenDropdown((current) => {
        const next = current === label ? null : label;
        writeOpenSidebarDropdown(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!navReady) return;
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const active = findActiveDropdown(pathname);
    if (active) {
      setOpenDropdownPersisted(active.label);
    }
  }, [pathname, navReady, setOpenDropdownPersisted]);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800/50 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-500">
          {isReady && branding.logoDataUrl ? (
            <Image
              src={branding.logoDataUrl}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <Truck className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {isReady ? branding.companyName : "Jonah's Movers"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {isReady ? branding.productName : "MoveHQ"}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navigation.map((entry) =>
            entry.type === "link" ? (
              <NavLinkItem key={entry.href} item={entry} pathname={pathname} />
            ) : (
              <li key={entry.label}>
                <NavDropdownSection
                  dropdown={entry}
                  pathname={pathname}
                  open={openDropdown === entry.label}
                  onToggle={() => handleDropdownToggle(entry.label)}
                />
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-slate-500">Planning shell · v0.1</p>
        <p className="text-xs text-slate-600">Settings saved locally</p>
      </div>
    </aside>
  );
}
