"use client";

import { useState } from "react";
import Link from "next/link";

import { MoveDetailBackLink } from "@/components/moves/detail/MoveDetailBackLink";
import { MoveDetailScrollProvider } from "@/components/moves/detail/MoveDetailScrollContext";
import { MoveDetailMain } from "@/components/moves/detail/MoveDetailMain";
import { MoveDetailOverviewCard } from "@/components/moves/detail/MoveDetailOverviewCard";
import { MoveFollowUpsSidebar } from "@/components/moves/detail/MoveFollowUpsPanel";
import { MoveCrewFeedbackPanel } from "@/components/moves/detail/MoveCrewFeedbackPanel";
import { MoveScheduledWalkthroughPanel } from "@/components/moves/detail/MoveScheduledWalkthroughPanel";
import { WebIntakeQueuePanel } from "@/components/moves/detail/WebBookingReviewPanel";
import { MoveContactSidebar } from "@/components/moves/detail/MoveContactSidebar";
import { MoveDetailRightRail } from "@/components/moves/detail/MoveDetailRightRail";
import {
  MoveSendDocumentProvider,
  useMoveSendDocument,
} from "@/components/moves/detail/MoveSendDocumentProvider";
import { MoveQuickActionSidebar } from "@/components/moves/detail/MoveQuickActionSidebar";
import type { FollowUpComposerChannel } from "@/lib/moves/follow-up-display";
import type { MoveDetailMainTabId, MoveQuickActionId } from "@/lib/moves/detail-layout";
import { buildMoveCustomerPortalPath } from "@/lib/moves/move-customer-portal";
import {
  isExternalQuickAction,
  isNavigationQuickAction,
} from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";
import { ROUTES } from "@/lib/navigation/routes";

type MoveDetailViewProps = {
  move: MoveRecord;
};

export function MoveDetailView({ move }: MoveDetailViewProps) {
  return (
    <MoveSendDocumentProvider move={move}>
      <MoveDetailViewBody move={move} />
    </MoveSendDocumentProvider>
  );
}

function MoveDetailViewBody({ move }: { move: MoveRecord }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [quickAction, setQuickAction] = useState<MoveQuickActionId | null>(null);
  const [followUpsOpen, setFollowUpsOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MoveDetailMainTabId>("move-plan");

  function scrollToMainTabs() {
    requestAnimationFrame(() => {
      document.getElementById("move-detail-tabs")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openMovePlan() {
    setMainTab("move-plan");
    scrollToMainTabs();
  }

  function handleQuickAction(action: MoveQuickActionId) {
    if (isExternalQuickAction(action)) {
      window.open(
        buildMoveCustomerPortalPath(move.id, { staffPreview: true }),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    if (isNavigationQuickAction(action)) {
      setMainTab("profitability");
      scrollToMainTabs();
      return;
    }

    setQuickAction(action);
  }

  function openAddFollowUp() {
    setFollowUpsOpen(false);
    setQuickAction("add-follow-up");
  }

  function openFollowUpChannel(channel: FollowUpComposerChannel) {
    setFollowUpsOpen(false);
    setQuickAction(channel);
  }

  return (
    <>
      <div className="-m-4 flex min-h-0 flex-col lg:-m-6 lg:h-[calc(100vh-4rem)] lg:flex-row">
        <MoveDetailScrollProvider className="min-h-0 min-w-0 flex-1 overflow-x-hidden lg:overflow-y-auto">
          <MoveDetailBackLink move={move} />

          <div className="space-y-3 px-4 py-3 lg:px-5">
            <MoveDetailOverviewCard move={move} onOpenMovePlan={openMovePlan} />
            <MoveScheduledWalkthroughPanel
              move={move}
              onReschedule={() => setQuickAction("book-walkthrough")}
            />
            <WebIntakeQueuePanel move={move} />
            <MoveCrewFeedbackPanel move={move} />
          </div>

          <MoveDetailMain move={move} activeTab={mainTab} onTabChange={setMainTab} />
        </MoveDetailScrollProvider>

        <div className="flex min-w-0 max-w-full shrink-0 flex-col overflow-hidden border-t border-slate-200 max-lg:max-h-[min(50vh,28rem)] lg:h-full lg:w-80 lg:max-w-80 lg:border-l lg:border-t-0">
          <MoveDetailRightRail
            move={move}
            onOpenContact={() => setContactOpen(true)}
            onQuickAction={handleQuickAction}
            onSeeAllFollowUps={() => setFollowUpsOpen(true)}
            onOpenFollowUpChannel={openFollowUpChannel}
          />
        </div>
      </div>

      <MoveContactSidebar
        move={move}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      <MoveFollowUpsSidebar
        move={move}
        open={followUpsOpen}
        onClose={() => setFollowUpsOpen(false)}
        onAddFollowUp={openAddFollowUp}
        onOpenChannel={openFollowUpChannel}
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
