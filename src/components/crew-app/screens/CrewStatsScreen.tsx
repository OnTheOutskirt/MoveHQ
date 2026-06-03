"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { issueTypeLabel, openIssueCount, summarizeIssues } from "@/lib/crew-app/stats";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { AlertTriangle, Star } from "lucide-react";
import { useMemo } from "react";

export function CrewStatsScreen() {
  const { myIssues, session } = useCrewApp();
  const summaries = useMemo(() => summarizeIssues(myIssues), [myIssues]);
  const openCount = openIssueCount(myIssues);

  const isSkipper = session.primaryRole === "skipper";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Open issues
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{openCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            On record
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {summaries.length}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Same track-record data as Operations → Crew. Only your issues are shown here.
      </p>

      {isSkipper ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <Star className="mb-1 inline h-3.5 w-3.5 text-amber-600" /> As{" "}
          <span className="font-semibold">skipper</span>, you&apos;ll also see team ratings and
          leadership stats in a later release.
        </div>
      ) : null}

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
          No issues on file — keep it up.
        </div>
      ) : (
        <ul className="space-y-2">
          {summaries.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    item.status === "open" || item.status === "under_review"
                      ? "text-amber-500"
                      : "text-slate-400",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {issueTypeLabel(item.type)} · {formatMoveDate(item.date)} ·{" "}
                    {item.statusLabel}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
