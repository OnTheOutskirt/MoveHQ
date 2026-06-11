"use client";

import { useEffect, useState } from "react";
import { NextActionBanner } from "@/components/moves/detail/workspace/NextActionBanner";
import { MoveCustomerPortalPanel } from "@/components/moves/detail/MoveCustomerPortalPanel";
import { MoveDetailLeadSourcePanel } from "@/components/moves/detail/MoveDetailLeadSourcePanel";
import { MoveDetailMediaPanel } from "@/components/moves/detail/MoveDetailMediaPanel";
import { MoveDetailPeopleRailSection } from "@/components/moves/detail/MoveDetailPeopleRailSection";
import {
  getAllMoveQuickActions,
  getMoveQuickActions,
  moveQuickActionsHasMore,
  MOVE_QUICK_ACTIONS_WITH_PANEL,
  type MoveQuickActionId,
} from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";
import {
  Calendar,
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  FileSignature,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Send,
  StickyNote,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ACTION_ICONS: Record<MoveQuickActionId, LucideIcon> = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
  note: StickyNote,
  "follow-up": CalendarClock,
  "book-walkthrough": Calendar,
  "check-quote": Phone,
  "send-reminder": Send,
  "collect-deposit": DollarSign,
  "send-contract": FileSignature,
  "confirm-move": ClipboardCheck,
  "ops-handoff": Truck,
  "collect-payment": DollarSign,
  "final-invoice": FileText,
};

type MoveDetailRightRailProps = {
  move: MoveRecord;
  onOpenContact: () => void;
  onQuickAction: (action: MoveQuickActionId) => void;
};

export function MoveDetailRightRail({
  move,
  onOpenContact,
  onQuickAction,
}: MoveDetailRightRailProps) {
  const [showAllActions, setShowAllActions] = useState(false);
  const hasMoreActions = moveQuickActionsHasMore(move);
  const actions = showAllActions ? getAllMoveQuickActions(move) : getMoveQuickActions(move);

  useEffect(() => {
    setShowAllActions(false);
  }, [move.id]);

  return (
    <aside
      className="flex h-full min-w-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-auto border-l border-slate-200 bg-white"
      aria-label="Up next, quick actions, shipper, and lead source"
    >
      <div className="shrink-0 border-b border-slate-200">
        <NextActionBanner move={move} compact />
      </div>

      <div className="shrink-0 border-b border-slate-200 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quick actions
          </p>
          {hasMoreActions ? (
            <button
              type="button"
              onClick={() => setShowAllActions((open) => !open)}
              className="shrink-0 text-[11px] font-medium text-slate-400 hover:text-brand-600"
            >
              {showAllActions ? "View less" : "View all"}
            </button>
          ) : null}
        </div>
        <div className="mt-2 grid min-w-0 grid-cols-2 gap-1.5">
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action.id] ?? StickyNote;
            const opensPanel = MOVE_QUICK_ACTIONS_WITH_PANEL.includes(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onQuickAction(action.id)}
                className="inline-flex min-w-0 items-center justify-start gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-medium leading-tight text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                title={opensPanel ? action.label : `${action.label} — coming soon`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate text-left">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <MoveCustomerPortalPanel move={move} />

      <MoveDetailPeopleRailSection move={move} onOpenContact={onOpenContact} />

      <MoveDetailLeadSourcePanel move={move} />

      <MoveDetailMediaPanel move={move} />
    </aside>
  );
}
