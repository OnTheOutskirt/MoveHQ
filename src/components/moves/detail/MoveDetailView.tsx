"use client";

import { useState } from "react";
import Link from "next/link";

import { MoveDetailBackLink } from "@/components/moves/detail/MoveDetailBackLink";
import { MoveDetailScrollProvider } from "@/components/moves/detail/MoveDetailScrollContext";
import { MoveDetailMain } from "@/components/moves/detail/MoveDetailMain";
import { MoveDetailOverviewCard } from "@/components/moves/detail/MoveDetailOverviewCard";
import { MoveContactSidebar } from "@/components/moves/detail/MoveContactSidebar";
import { MoveDetailRightRail } from "@/components/moves/detail/MoveDetailRightRail";
import { MoveQuickActionSidebar } from "@/components/moves/detail/MoveQuickActionSidebar";
import type { MoveDetailMainTabId, MoveQuickActionId } from "@/lib/moves/detail-layout";
import type { MoveRecord } from "@/lib/moves/types";
import { ROUTES } from "@/lib/navigation/routes";

type MoveDetailViewProps = {
  move: MoveRecord;
};

export function MoveDetailView({ move }: MoveDetailViewProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [quickAction, setQuickAction] = useState<MoveQuickActionId | null>(null);
  const [mainTab, setMainTab] = useState<MoveDetailMainTabId>("move-plan");

  function openMovePlan() {
    setMainTab("move-plan");
    requestAnimationFrame(() => {
      document.getElementById("move-detail-tabs")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleQuickAction(action: MoveQuickActionId) {
    setQuickAction(action);
  }

  return (
    <>
      <div className="-m-4 flex min-h-0 flex-col lg:-m-6 lg:h-[calc(100vh-4rem)] lg:flex-row">
        {/* Left: only scroll container on desktop — sticky tabs pin to its top edge */}
        <MoveDetailScrollProvider className="min-h-0 min-w-0 flex-1 overflow-x-hidden lg:overflow-y-auto">
          <MoveDetailBackLink />

          <div className="space-y-3 px-4 py-3 lg:px-5">
            <MoveDetailOverviewCard move={move} onOpenMovePlan={openMovePlan} />
          </div>

          <MoveDetailMain move={move} activeTab={mainTab} onTabChange={setMainTab} />
        </MoveDetailScrollProvider>

        <div className="flex min-w-0 max-w-full shrink-0 flex-col overflow-hidden border-t border-slate-200 max-lg:max-h-[min(50vh,28rem)] lg:h-full lg:w-80 lg:max-w-80 lg:border-l lg:border-t-0">
          <MoveDetailRightRail
            move={move}
            onOpenContact={() => setContactOpen(true)}
            onQuickAction={handleQuickAction}
          />
        </div>
      </div>

      <MoveContactSidebar
        move={move}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      <MoveQuickActionSidebar
        move={move}
        action={quickAction}
        onClose={() => setQuickAction(null)}
      />
    </>
  );
}

type MoveDetailNotFoundProps = {
  moveId: string;
};

export function MoveDetailNotFound({ moveId }: MoveDetailNotFoundProps) {
  return (
    <div className="-mx-4 rounded-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center lg:-mx-6">
      <p className="text-sm font-medium text-slate-900">Move not found</p>
      <p className="mt-1 text-sm text-slate-500">No record for &ldquo;{moveId}&rdquo;.</p>
      <Link
        href={ROUTES.salesMoves}
        className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Return to Moves
      </Link>
    </div>
  );
}
