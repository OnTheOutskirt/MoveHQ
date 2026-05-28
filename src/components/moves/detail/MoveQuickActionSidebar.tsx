"use client";

import { BookWalkthroughPanel } from "@/components/moves/detail/quick-actions/BookWalkthroughPanel";
import { QuickActionComposer } from "@/components/moves/detail/quick-actions/QuickActionComposer";
import { QuickActionHistoryFeed } from "@/components/moves/detail/quick-actions/QuickActionHistoryFeed";
import { useMoves } from "@/components/moves/MovesProvider";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { getCommunicationHistory } from "@/lib/moves/communication-history";
import {
  quickActionHasHistory,
  quickActionLabel,
  type MoveQuickActionId,
} from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";
import { Mail, Phone } from "lucide-react";
import { useMemo } from "react";

type MoveQuickActionSidebarProps = {
  move: MoveRecord;
  action: MoveQuickActionId | null;
  onClose: () => void;
};

function panelSubtitle(move: MoveRecord, action: MoveQuickActionId): string {
  if (action === "call" && move.customerPhone) return move.customerPhone;
  if (action === "sms" && move.customerPhone) return move.customerPhone;
  if (action === "email" && move.customerEmail) return move.customerEmail;
  return move.customerName;
}

export function MoveQuickActionSidebar({ move, action, onClose }: MoveQuickActionSidebarProps) {
  const { moves } = useMoves();

  const reps = useMemo(() => {
    const names = new Set(moves.map((m) => m.assignedRep));
    names.add(move.assignedRep);
    return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [moves, move.assignedRep]);

  if (!action) return null;

  const title = quickActionLabel(action);
  const isBookWalkthrough = action === "book-walkthrough";
  const showHistory = quickActionHasHistory(action);
  const history = showHistory ? getCommunicationHistory(move, action) : [];

  const composer = !isBookWalkthrough ? <QuickActionComposer action={action} move={move} /> : null;

  return (
    <DetailSidebar
      open
      title={title}
      description={panelSubtitle(move, action)}
      onClose={onClose}
      widthClassName="max-w-lg"
      bodyClassName={
        isBookWalkthrough
          ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          : showHistory
            ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            : undefined
      }
      headerExtra={
        action === "call" || action === "sms" || action === "email" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {action === "call" ? (
              <Phone className="h-3 w-3" />
            ) : action === "email" ? (
              <Mail className="h-3 w-3" />
            ) : null}
            {move.customerName}
          </span>
        ) : null
      }
      footer={
        composer ? (
          <div className="border-t border-slate-200 bg-slate-50/90 px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
            {composer}
          </div>
        ) : undefined
      }
    >
      {isBookWalkthrough ? (
        <BookWalkthroughPanel move={move} reps={reps} />
      ) : showHistory ? (
        <QuickActionHistoryFeed action={action} items={history} />
      ) : (
        <div className="px-5 py-5">
          <StageActionSummary action={action} move={move} />
        </div>
      )}
    </DetailSidebar>
  );
}

function StageActionSummary({
  action,
  move,
}: {
  action: MoveQuickActionId;
  move: MoveRecord;
}) {
  const copy: Partial<Record<MoveQuickActionId, string>> = {
    "check-quote": "Log outreach about the open estimate and nudge toward a decision.",
    "send-reminder": "Automated reminders can also run — use this for a personal touch.",
    "collect-deposit": "Record deposit once received — updates contract readiness.",
    "send-contract": "Sends the e-sign packet; you’ll be notified when it’s signed.",
    "confirm-move": "Sends move-day confirmation to the shipper and logs it on the job.",
    "ops-handoff": "Posts scope notes to dispatch without leaving this move.",
    "collect-payment": "Apply final payment against the move balance.",
    "final-invoice": "Review line items, then email the closing invoice.",
  };

  const text = copy[action];
  if (!text) return null;

  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-600">
      {text}
      <span className="mt-2 block text-xs text-slate-400">{move.reference}</span>
    </p>
  );
}
