"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { Button } from "@/components/ui/Button";
import { MoveJobDayCard } from "@/components/moves/detail/MoveJobDayCard";
import { formatMoveDate } from "@/lib/moves/format";
import {
  getJobDayPlanRows,
  isPreBookPipelineStage,
  type JobDayPlanRow,
} from "@/lib/moves/job-days-plan";
import { hasProposedJobDays } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";

type MoveJobDaysPlanProps = {
  move: MoveRecord;
};

function SuggestionCard({
  row,
  index,
}: {
  row: Extract<JobDayPlanRow, { kind: "suggestion" }>;
  index: number;
}) {
  return (
    <li className="rounded-lg border border-dashed border-violet-300 bg-violet-50/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-violet-400 text-[10px] font-bold text-violet-700">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{row.label}</p>
            <p className="mt-0.5 text-xs text-slate-600">
              {row.dateHint ?? "Date from intake"}
              {row.recommendation ? ` · ${row.recommendation}` : null}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
          Suggested
        </span>
      </div>
    </li>
  );
}

export function MoveJobDaysPlan({ move }: MoveJobDaysPlanProps) {
  const rows = getJobDayPlanRows(move);
  const preBook = isPreBookPipelineStage(move.pipelineStage);
  const hasDays = move.jobDays.length > 0;
  const proposedOnly = hasProposedJobDays(move);
  const moveDate = move.intake.moveDate || move.preferredDate;

  return (
    <DetailSection
      title="Job days"
      description={
        preBook
          ? "Plan packing, load, and delivery days before you send the quote — they go on the proposal."
          : "Days for this move. Crew and trucks lock in after booking."
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled title="Coming soon">
          <Plus className="h-3.5 w-3.5" />
          Add day
        </Button>
        {!hasDays ? (
          <Button type="button" size="sm" variant="secondary" disabled title="Coming soon">
            <Sparkles className="h-3.5 w-3.5" />
            Suggest from intake
          </Button>
        ) : null}
        {!preBook ? (
          <Link
            href="/calendar"
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open calendar
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-900">No job days yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Add at least one day before quoting — e.g. packing and load on{" "}
            {moveDate ? formatMoveDate(moveDate) : "the move date"}.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) =>
            row.kind === "job_day" ? (
              <MoveJobDayCard key={row.day.id} move={move} day={row.day} index={i} />
            ) : (
              <SuggestionCard key={row.id} row={row} index={i} />
            ),
          )}
        </ul>
      )}

      {proposedOnly && hasDays ? (
        <p className="mt-3 rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-900">
          These days are on the quote as <strong>proposed</strong>. After the client books and
          pays deposit, confirm each day on the move calendar.
        </p>
      ) : null}

      {preBook && !hasDays && rows.length > 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          Suggestions are from intake — add them as job days, then build your quote.
        </p>
      ) : null}
    </DetailSection>
  );
}
