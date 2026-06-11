"use client";

import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { CountBadge } from "@/components/ui/CountBadge";
import { useMoves } from "@/components/moves/MovesProvider";
import { collectOpsPrepTasks, openOpsPrepTasks } from "@/lib/operations/ops-prep-tasks";
import type { NavLink } from "@/lib/tokens/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type SidebarOperationsJobsNavProps = {
  item: NavLink;
};

export function SidebarOperationsJobsNav({ item }: SidebarOperationsJobsNavProps) {
  const pathname = usePathname();
  const { moves } = useMoves();
  const doneIds = useOpsPrepDoneIds();

  const openCount = useMemo(() => {
    const tasks = collectOpsPrepTasks(moves);
    return openOpsPrepTasks(tasks, doneIds).length;
  }, [moves, doneIds]);

  const Icon = item.icon;
  const linkActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <li>
      <Link
        href={item.href}
        prefetch={false}
        className={cn(
          "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          linkActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {openCount > 0 ? (
          <CountBadge count={openCount} urgent={openCount > 0} variant="sidebar" />
        ) : null}
      </Link>
    </li>
  );
}
