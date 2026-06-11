"use client";

import { MoveContactPanel } from "@/components/moves/detail/MoveContactPanel";
import { MoveWaitingSubstagePicker } from "@/components/moves/detail/MoveWaitingSubstagePicker";
import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { formatMoveDate, formatQuote } from "@/lib/moves/format";
import {
  bookingReviewLabel,
  conditionStatusLabel,
} from "@/lib/moves/move-condition";
import { getFollowUpDueBucket, getNextOpenFollowUp } from "@/lib/moves/move-follow-ups";
import { moveDetailStageDisplayLabel } from "@/lib/moves/move-pipeline";
import { getMoveEstimatedValue, quadrantInputsLabel } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type MoveDetailOverviewTabProps = {
  move: MoveRecord;
  onNavigateTab?: (tab: string) => void;
};

function SnapshotField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{children}</div>
    </div>
  );
}

export function MoveDetailOverviewTab({ move, onNavigateTab }: MoveDetailOverviewTabProps) {
  const nextFu = getNextOpenFollowUp(move);
  const fuBucket = nextFu ? getFollowUpDueBucket(nextFu) : null;
  const est = getMoveEstimatedValue(move);

  const blockers: string[] = [];
  if (move.conditionStatus === "needs_review") {
    blockers.push(`Booking review: ${bookingReviewLabel(move.bookingReviewStatus)}`);
  }
  if (move.pipelineStage === "waiting" && !move.waitingSubstage) {
    blockers.push("Set a waiting reason");
  }
  if (fuBucket === "overdue" && nextFu) {
    blockers.push(`Follow-up overdue: ${nextFu.title}`);
  }

  return (
    <div className="space-y-6 px-4 py-5 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Snapshot</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SnapshotField label="Pipeline stage">{moveDetailStageDisplayLabel(move)}</SnapshotField>
              <SnapshotField label="Status">{conditionStatusLabel(move.conditionStatus)}</SnapshotField>
              <SnapshotField label="Priority">
                <span className="inline-flex items-center gap-2">
                  <QuadrantBadge move={move} />
                  <span className="text-xs text-slate-500">{quadrantInputsLabel(move)}</span>
                </span>
              </SnapshotField>
              <SnapshotField label="Estimate">
                {formatQuote(est, move.quoteType)}
              </SnapshotField>
              <SnapshotField label="Move date">
                {formatMoveDate(move.preferredDate)}
              </SnapshotField>
              <SnapshotField label="Assigned">
                {move.assignedRep}
                {move.coordinator ? ` · Coord. ${move.coordinator}` : ""}
              </SnapshotField>
            </div>

            {move.bookingReviewStatus !== "not_required" ? (
              <p className="mt-3 rounded-md bg-violet-50 px-3 py-2 text-sm text-violet-900">
                Booking review: {bookingReviewLabel(move.bookingReviewStatus)}
              </p>
            ) : null}

            <MoveWaitingSubstagePicker move={move} className="mt-3" />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Next follow-up</h2>
            {nextFu ? (
              <div className="mt-3">
                <p className="font-medium text-slate-900">{nextFu.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Due {formatMoveDate(nextFu.dueAt.slice(0, 10))} · {nextFu.channel} ·{" "}
                  {nextFu.assignedTo}
                </p>
                {fuBucket === "overdue" ? (
                  <p className="mt-1 text-sm font-medium text-amber-800">Overdue</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No open follow-up scheduled.</p>
            )}
            {move.followUps.length > 0 ? (
              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                {move.followUps.map((fu) => (
                  <li
                    key={fu.id}
                    className={cn(
                      "flex justify-between gap-2 text-sm",
                      fu.status !== "open" && "text-slate-400",
                    )}
                  >
                    <span>{fu.title}</span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {fu.status} · {formatMoveDate(fu.dueAt.slice(0, 10))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {blockers.length > 0 ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
              <h2 className="text-sm font-semibold text-amber-900">Current blockers</h2>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <NavButton onClick={() => onNavigateTab?.("move-plan")}>Move scope</NavButton>
            <NavButton onClick={() => onNavigateTab?.("quote-contract")}>Quote &amp; contract</NavButton>
            <NavButton onClick={() => onNavigateTab?.("payment")}>Payment</NavButton>
          </div>
        </div>

        <MoveContactPanel move={move} />
      </div>
    </div>
  );
}

function NavButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50"
    >
      {children}
    </button>
  );
}
