"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveClaimsSection } from "@/components/moves/detail/MoveClaimsSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { formatJobDayDate } from "@/lib/moves/job-days-plan";
import { jobDayStatusLabel } from "@/lib/moves/job-days";
import { jobDayCrewLine, jobDayTruckLine } from "@/lib/moves/job-day-display";
import {
  OPERATIONS_SECTION_IDS,
  OPERATIONS_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { claimsForMove, formatClaimMoney } from "@/lib/operations/claims";
import { cn } from "@/lib/utils";
import { FileText, ShieldAlert, Users } from "lucide-react";

type MoveDetailOperationsTabProps = {
  move: MoveRecord;
};

function MoveDayOpsBlock({
  day,
  index,
  dayClaimCount,
  dayClaimTotal,
}: {
  day: MoveJobDay;
  index: number;
  dayClaimCount: number;
  dayClaimTotal: number;
}) {
  const crew = jobDayCrewLine(day);
  const truck = jobDayTruckLine(day);
  const booked = day.status !== "proposed" && day.status !== "cancelled";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Day {index + 1}</p>
          <h3 className="font-semibold text-slate-900">{day.label}</h3>
          <p className="mt-0.5 text-sm text-slate-600">
            {formatJobDayDate(day.date)}
            {day.arrivalWindow ? ` · ${day.arrivalWindow}` : ""}
          </p>
        </div>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {jobDayStatusLabel(day.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
            <Users className="h-3.5 w-3.5" />
            Assigned crew
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {booked && crew && !crew.includes("proposed") && !crew.includes("Unassigned")
              ? crew
              : "Not assigned"}
          </p>
          {day.dispatchNotes ? (
            <p className="mt-1 text-xs text-slate-600">{day.dispatchNotes}</p>
          ) : null}
        </div>
        <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Trucks</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{truck ?? "Not assigned"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center">
          <FileText className="mx-auto h-5 w-5 text-slate-400" />
          <p className="mt-2 text-xs font-medium text-slate-700">Move day contract / BOL</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Upload &amp; e-sign — coming soon</p>
        </div>
        <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center">
          <ShieldAlert className="mx-auto h-5 w-5 text-slate-400" />
          <p className="mt-2 text-xs font-medium text-slate-700">Claims for this day</p>
          <p className="mt-0.5 text-[10px] text-slate-500">None filed</p>
        </div>
      </div>

      {day.hoursActual != null ? (
        <p className="mt-3 text-xs text-slate-500">
          Actual hours: <span className="font-medium text-slate-800">{day.hoursActual}</span>
          {day.hoursEstimated != null ? ` (est. ${day.hoursEstimated})` : ""}
        </p>
      ) : null}
    </article>
  );
}

export function MoveDetailOperationsTab({ move }: MoveDetailOperationsTabProps) {
  const { claims } = useClaims();
  const moveClaims = claimsForMove(claims, move.id);
  const days = [...move.jobDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <MoveDetailTabSections sections={OPERATIONS_SECTIONS} ariaLabel="Operations sections">
      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.moveDays}>
        {days.length === 0 ? (
          <DetailSection title="Move days">
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
              No job days yet. Add them on the Move Plan tab before dispatch.
            </div>
          </DetailSection>
        ) : (
          <div className="space-y-4">
            {days.map((day, i) => {
              const dayClaims = moveClaims.filter((c) => c.jobDayId === day.id);
              const dayClaimTotal = dayClaims.reduce((s, c) => s + c.amountClaimed, 0);
              return (
                <MoveDayOpsBlock
                  key={day.id}
                  day={day}
                  index={i}
                  dayClaimCount={dayClaims.length}
                  dayClaimTotal={dayClaimTotal}
                />
              );
            })}
          </div>
        )}
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.claims}>
        <DetailSection title="Claims (move-wide)">
          <MoveClaimsSection move={move} />
        </DetailSection>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.dispatch}>
        <DetailSection title="Crew & trucks (dispatch board)">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
            Link to dispatch calendar for live assignments — coming soon
          </div>
        </DetailSection>
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}
