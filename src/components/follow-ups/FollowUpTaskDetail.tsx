"use client";

import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { formatMoveDate, formatQuote, moveRouteLabel } from "@/lib/moves/format";
import type { FollowUpQueueItem } from "@/lib/moves/follow-ups";
import { getFollowUpDueBucket, resolveFollowUpSource } from "@/lib/moves/move-follow-ups";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

const SOURCE_LABEL = {
  manual: "Manual follow-up",
  automation: "Automated rule",
  scheduled: "Scheduled",
} as const;

type FollowUpTaskDetailProps = {
  item: FollowUpQueueItem;
};

export function FollowUpTaskDetail({ item }: FollowUpTaskDetailProps) {
  const { followUp, move } = item;
  const bucket = getFollowUpDueBucket(followUp);
  const source = resolveFollowUpSource(followUp);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {SOURCE_LABEL[source]}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{followUp.title}</h3>
            <p className="mt-1 text-sm text-slate-600">
              Due {formatMoveDate(followUp.dueAt.slice(0, 10))} · {followUp.channel} ·{" "}
              {followUp.assignedTo}
            </p>
          </div>
          <QuadrantBadge move={move} />
        </div>
        {bucket === "overdue" ? (
          <p className="mt-2 text-sm font-medium text-amber-800">Overdue — contact today</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Move</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{move.customerName}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <span className="truncate">{moveRouteLabel(move.originAddress, move.destinationAddress)}</span>
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Stage
              </dt>
              <dd className="mt-0.5 text-slate-900">{moveStageDisplayLabel(move)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Quote
              </dt>
              <dd className="mt-0.5 text-slate-900">
                {formatQuote(move.quoteAmount, move.quoteType)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Move date
              </dt>
              <dd className="mt-0.5 text-slate-900">{formatMoveDate(move.preferredDate)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Rep
              </dt>
              <dd className="mt-0.5 text-slate-900">{move.assignedRep}</dd>
            </div>
          </dl>
        </section>

        {followUp.notes ? (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
            <p className="mt-1 text-sm text-slate-700">{followUp.notes}</p>
          </section>
        ) : null}

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            All follow-ups on this move
          </p>
          <ul className="mt-3 space-y-2">
            {move.followUps.map((fu) => (
              <li
                key={fu.id}
                className={cn(
                  "flex items-center justify-between gap-2 text-sm",
                  fu.status !== "open" && "text-slate-400",
                  fu.id === followUp.id && "font-medium text-brand-800",
                )}
              >
                <span className="min-w-0 truncate">{fu.title}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {fu.status} · {formatMoveDate(fu.dueAt.slice(0, 10))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="shrink-0 border-t border-slate-100 px-4 py-3">
        <Link
          href={salesMovePath(move.id)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Open move
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={salesMovePath(move.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          New tab
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
