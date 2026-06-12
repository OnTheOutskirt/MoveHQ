"use client";

import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { OfficeTimeClockMenu } from "@/components/layout/OfficeTimeClockMenu";
import { ReportFeedbackMenu } from "@/components/layout/ReportFeedbackMenu";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { Menu, Plus } from "lucide-react";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { openNewMoveDialog } = useMovesActions();

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
        <GlobalSearch />
        <Button
          type="button"
          size="sm"
          className="hidden shrink-0 sm:inline-flex"
          onClick={openNewMoveDialog}
        >
          <Plus className="h-4 w-4" />
          New move
        </Button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ReportFeedbackMenu />
        <OfficeTimeClockMenu />
        <NotificationsMenu />
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <UserProfileMenu />
      </div>
    </header>
  );
}
