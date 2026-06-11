"use client";

import { FollowUpsRepList } from "@/components/follow-ups/FollowUpsRepList";
import { FollowUpsRepPanel } from "@/components/follow-ups/FollowUpsRepPanel";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  filterMovesForFollowUpScope,
  followUpCountsByRep,
  followUpSummary,
} from "@/lib/moves/follow-ups";
import { pageMeta } from "@/lib/navigation/page-meta";
import { ROUTES } from "@/lib/navigation/routes";
import { repFilterForPersona } from "@/lib/session/personas";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const meta = pageMeta["/sales/follow-ups"];

export function FollowUpsWorkspace() {
  const { user } = useSession();
  const { moves } = useMoves();
  const repFilter = repFilterForPersona(user);
  const isAdminView = user.followUpScope === "all";

  const filtered = useMemo(
    () => filterMovesForFollowUpScope(moves, repFilter),
    [moves, repFilter],
  );

  const repRows = useMemo(() => followUpCountsByRep(filtered), [filtered]);
  const summary = useMemo(() => followUpSummary(filtered), [filtered]);

  const defaultRep = isAdminView
    ? (repRows[0]?.rep ?? null)
    : user.assignedRep;

  const [selectedRep, setSelectedRep] = useState<string | null>(defaultRep);

  useEffect(() => {
    if (isAdminView) {
      if (repRows.length === 0) {
        setSelectedRep(null);
        return;
      }
      if (!selectedRep || !repRows.some((row) => row.rep === selectedRep)) {
        setSelectedRep(repRows[0].rep);
      }
      return;
    }
    setSelectedRep(user.assignedRep);
  }, [isAdminView, repRows, selectedRep, user.assignedRep]);

  const isEmpty = summary.total === 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <PageHeader
        title={meta.title}
        description={
          isAdminView
            ? `Team follow-ups — ${summary.total} open across ${repRows.length} reps`
            : `Your follow-ups — ${user.name}`
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={ListChecks}
          title="No follow-ups due"
          description={
            isAdminView
              ? "When moves have open follow-ups, they will appear here by salesperson."
              : "When a move assigned to you has a follow-up date, it will show up here."
          }
        >
          <Link
            href={ROUTES.salesMoves}
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all moves
          </Link>
        </EmptyState>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isAdminView ? (
            <div
              className={cn(
                "flex min-h-0 w-full flex-col overflow-hidden border-slate-200 lg:w-1/4 lg:max-w-[18rem] lg:shrink-0 lg:border-r",
                selectedRep ? "hidden lg:flex" : "flex",
              )}
            >
              <div className="shrink-0 border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sales team ({repRows.length})
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {summary.overdue > 0 ? (
                    <span className="font-medium text-amber-800">{summary.overdue} overdue</span>
                  ) : (
                    `${summary.total} open`
                  )}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FollowUpsRepList
                  reps={repRows}
                  selectedRep={selectedRep}
                  onSelectRep={setSelectedRep}
                />
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
              isAdminView && selectedRep ? "flex" : isAdminView ? "hidden lg:flex" : "flex",
            )}
          >
            {isAdminView && selectedRep ? (
              <div className="flex shrink-0 items-center border-b border-slate-100 px-3 py-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedRep(null)}
                  className="text-sm font-medium text-brand-600"
                >
                  ← All reps
                </button>
              </div>
            ) : null}

            {selectedRep ? (
              <FollowUpsRepPanel rep={selectedRep} moves={filtered} />
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
                Select a salesperson to review their follow-ups.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
