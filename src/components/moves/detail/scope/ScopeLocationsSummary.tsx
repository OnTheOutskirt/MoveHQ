"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { formatMoveDate } from "@/lib/moves/format";
import { buildJobDayRouteSegments } from "@/lib/moves/move-route-summary";
import { SCOPE_SECTION_IDS } from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";
import { ArrowRight, Pencil } from "lucide-react";

type ScopeLocationsSummaryProps = {
  move: MoveRecord;
  onEditJobDay: (dayId: string) => void;
};

export function ScopeLocationsSummary({ move, onEditJobDay }: ScopeLocationsSummaryProps) {
  const segments = buildJobDayRouteSegments(move);

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.locations}>
      <DetailSection
        title="Locations"
        description="Routes come from each job day. Edit addresses and access on the job day editor."
      >
        {segments.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add job days above, then set origin, destination, and stops on each day.
          </p>
        ) : (
          <ul className="space-y-3">
            {segments.map((seg) => (
              <li
                key={seg.dayId}
                className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {seg.dayLabel}
                      {seg.date ? (
                        <span className="ml-2 font-normal text-slate-500">
                          {formatMoveDate(seg.date)}
                        </span>
                      ) : null}
                    </p>
                    {seg.sameAsPrevious ? (
                      <p className="mt-0.5 text-xs text-violet-700">
                        Same locations as previous day
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditJobDay(seg.dayId)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit day
                  </button>
                </div>

                {!seg.sameAsPrevious ? (
                  <div className="mt-2 space-y-1.5 text-sm text-slate-800">
                    <p className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-500">From</span>
                      <span>{seg.from}</span>
                    </p>
                    {seg.stops.map((stop, i) => (
                      <p key={i} className="flex flex-wrap items-center gap-1.5 pl-3 text-slate-700">
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-500">Stop</span>
                        <span>{stop}</span>
                      </p>
                    ))}
                    <p className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-500">To</span>
                      <span>{seg.to}</span>
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}
