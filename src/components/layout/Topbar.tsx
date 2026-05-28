"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { followUpSummaryForRep } from "@/lib/moves/follow-ups";
import { CURRENT_USER } from "@/lib/session/current-user";
import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { moves } = useMoves();
  const myFollowUps = useMemo(
    () => followUpSummaryForRep(moves, CURRENT_USER.assignedRep),
    [moves],
  );
  const notificationCount = myFollowUps.total;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:gap-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden min-w-0 max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search customers, jobs, quotes..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            disabled
          />
        </div>
        <Button size="sm" className="hidden shrink-0 sm:inline-flex">
          Quick Add
        </Button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link
          href="/follow-ups"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label={
            notificationCount > 0
              ? `${notificationCount} follow-ups for you`
              : "No follow-ups"
          }
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Link>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{CURRENT_USER.name}</p>
            <p className="text-xs text-slate-500">{CURRENT_USER.title}</p>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
            aria-hidden
          >
            {CURRENT_USER.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
