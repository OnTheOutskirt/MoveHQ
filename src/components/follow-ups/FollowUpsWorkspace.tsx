"use client";

import { FollowUpRow } from "@/components/follow-ups/FollowUpRow";
import { useMoves } from "@/components/moves/MovesProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  followUpSummary,
  groupFollowUpMoves,
  type FollowUpBucket,
} from "@/lib/moves/follow-ups";
import { pageMeta } from "@/lib/navigation/page-meta";
import { ROUTES } from "@/lib/navigation/routes";
import { CURRENT_USER } from "@/lib/session/current-user";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const meta = pageMeta["/sales/follow-ups"];

const BUCKET_META: Record<
  FollowUpBucket,
  { title: string; description: string; accent: string }
> = {
  overdue: {
    title: "Overdue",
    description: "Past due — contact today",
    accent: "border-amber-300 bg-amber-50/60",
  },
  today: {
    title: "Due today",
    description: "Scheduled for today",
    accent: "border-brand-200 bg-brand-50/40",
  },
  upcoming: {
    title: "Coming up",
    description: "Future follow-ups",
    accent: "border-slate-200 bg-slate-50/50",
  },
};

export function FollowUpsWorkspace() {
  const { moves } = useMoves();

  const filtered = useMemo(
    () => moves.filter((m) => m.assignedRep === CURRENT_USER.assignedRep),
    [moves],
  );

  const groups = useMemo(() => groupFollowUpMoves(filtered), [filtered]);
  const summary = useMemo(() => followUpSummary(filtered), [filtered]);

  const isEmpty = summary.total === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description={`Your follow-ups — ${CURRENT_USER.name}`}
      />

      {isEmpty ? (
        <EmptyState
          icon={ListChecks}
          title="No follow-ups due"
          description="When a move assigned to you has a follow-up date, it will show up here."
        >
          <Link
            href={ROUTES.salesMoves}
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all moves
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <SummaryPill label="Overdue" value={summary.overdue} urgent={summary.overdue > 0} />
            <SummaryPill label="Today" value={summary.today} />
            <SummaryPill label="Upcoming" value={summary.upcoming} />
          </div>

          <div className="space-y-8">
            {(["overdue", "today", "upcoming"] as const).map((bucket) => {
              const items = groups[bucket];
              if (items.length === 0) return null;
              const cfg = BUCKET_META[bucket];

              return (
                <section key={bucket}>
                  <div className={cn("mb-3 rounded-lg border px-4 py-2", cfg.accent)}>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {cfg.title}
                      <span className="ml-2 font-normal text-slate-600">({items.length})</span>
                    </h2>
                    <p className="text-xs text-slate-600">{cfg.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {items.map((move) => (
                      <li key={move.id}>
                        <FollowUpRow move={move} bucket={bucket} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  urgent,
}: {
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center",
        urgent ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          "text-xl font-bold tabular-nums",
          urgent ? "text-amber-900" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
