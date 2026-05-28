"use client";

import { CountBadge } from "@/components/ui/CountBadge";
import { useMoves } from "@/components/moves/MovesProvider";
import { websiteQueueTotal } from "@/lib/moves/acquisition";
import type { NavLink } from "@/lib/tokens/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type SidebarWebsiteNavProps = {
  item: NavLink;
};

export function SidebarWebsiteNav({ item }: SidebarWebsiteNavProps) {
  const pathname = usePathname();
  const { moves } = useMoves();
  const total = useMemo(() => websiteQueueTotal(moves), [moves]);
  const Icon = item.icon;
  const linkActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          linkActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <CountBadge count={total} variant="sidebar" />
      </Link>
    </li>
  );
}
