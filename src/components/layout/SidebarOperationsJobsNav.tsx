"use client";

import { useManualOpsPrepTasks } from "@/components/operations/jobs/use-manual-ops-prep";
import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { DevIncompleteIndicator } from "@/components/layout/DevIncompleteIndicator";
import { CountBadge } from "@/components/ui/CountBadge";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { toDateKey } from "@/lib/calendar/date-utils";
import {
  collectOpsPrepTasks,
  mergeOpsPrepTasks,
  openOpsPrepTasksDueToday,
} from "@/lib/operations/ops-prep-tasks";
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
  const { settings } = useSettings();
  const doneIds = useOpsPrepDoneIds();
  const manualTasks = useManualOpsPrepTasks();

  const dueTodayCount = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const tasks = mergeOpsPrepTasks(
      collectOpsPrepTasks(moves, { rules: settings.opsPrepRules }),
      manualTasks,
    );
    return openOpsPrepTasksDueToday(tasks, doneIds, todayKey).length;
  }, [moves, doneIds, manualTasks, settings.opsPrepRules]);

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
        {item.devIncomplete ? <DevIncompleteIndicator /> : null}
        {dueTodayCount > 0 ? (
          <CountBadge count={dueTodayCount} urgent variant="sidebar" />
        ) : null}
      </Link>
    </li>
  );
}
