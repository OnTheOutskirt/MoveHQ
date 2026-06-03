"use client";

import {
  DayBeforeConfirmationPill,
  useOpsJobDayConfirmation,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import { Badge } from "@/components/ui/Badge";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate } from "@/lib/moves/format";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import {
  jobDayLocationLines,
  jobDayCrewLine,
  jobDayTruckLine,
  serviceLabel,
} from "@/lib/moves/job-day-display";
import { dayBeforeCallDueDateKey } from "@/lib/dispatch/day-before-confirmation";
import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import {
  readOpsConfirmationNote,
  subscribeOpsConfirmationNotes,
  writeOpsConfirmationNote,
} from "@/lib/operations/ops-confirmation-notes";
import type { MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { ClipboardList, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OpsJobDaySidebarProps = {
  row: OpsJobDayRow | null;
  move: MoveRecord | undefined;
  onClose: () => void;
};

export function OpsJobDaySidebar({ row, move, onClose }: OpsJobDaySidebarProps) {
  const { confirmation } = useOpsJobDayConfirmation(row ?? undefined, move);
  const [callNotes, setCallNotes] = useState("");

  const jobDay = useMemo(
    () => (row && move ? move.jobDays.find((d) => d.id === row.jobDayId) : undefined),
    [row, move],
  );

  const locations = useMemo(
    () => (move && jobDay ? jobDayLocationLines(move, jobDay) : null),
    [move, jobDay],
  );

  useEffect(() => {
    if (!row) return;
    setCallNotes(readOpsConfirmationNote(row.id));
    return subscribeOpsConfirmationNotes(() => {
      setCallNotes(readOpsConfirmationNote(row.id));
    });
  }, [row]);

  const open = Boolean(row);
  const statusStyle = row ? jobDayStatusConfig[row.status] : null;
  const callDueLabel = row
    ? formatMoveDate(dayBeforeCallDueDateKey(row.date))
    : null;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={row?.customerName ?? "Job day"}
      description={
        row
          ? `${row.dayLabel} · ${formatMoveDate(row.date)} · ${row.moveType}`
          : undefined
      }
      headerBelow={
        row && statusStyle ? (
          <Badge className={statusStyle.badge}>{jobDayStatusLabel(row.status)}</Badge>
        ) : null
      }
      widthClassName="max-w-xl"
    >
      {row && move && jobDay ? (
        <div className="space-y-4">
          {confirmation ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  Confirmation call
                </p>
                <DayBeforeConfirmationPill
                  jobId={row.id}
                  confirmation={confirmation}
                />
              </div>
              <p className="mt-2 text-sm text-amber-950">{confirmation.detail}</p>
              {callDueLabel ? (
                <p className="mt-1 text-xs text-amber-800/90">
                  Call window: day before move ({callDueLabel})
                </p>
              ) : null}
              <label
                htmlFor={`ops-call-notes-${row.id}`}
                className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-amber-900"
              >
                Call notes
              </label>
              <textarea
                id={`ops-call-notes-${row.id}`}
                value={callNotes}
                onChange={(e) => {
                  setCallNotes(e.target.value);
                  writeOpsConfirmationNote(row.id, e.target.value);
                }}
                rows={3}
                placeholder="Who you spoke with, time, voicemail, reschedule…"
                className="mt-1 w-full resize-y rounded-md border border-amber-200/80 bg-white/60 px-2.5 py-2 text-sm leading-snug text-amber-950 placeholder:text-amber-800/50 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
              />
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <StatCell label="Departure" value={jobDay.departureWindow ?? "—"} />
              <StatCell label="Arrival" value={jobDay.arrivalWindow ?? row.arrivalWindow ?? "—"} />
              <StatCell label="Duration" value={jobDay.durationLabel ?? row.durationLabel ?? "—"} />
              <StatCell label="Crew" value={jobDayCrewLine(jobDay) ?? row.crewLine ?? "—"} />
              <StatCell label="Trucks" value={jobDayTruckLine(jobDay) ?? row.truckLine ?? "—"} />
              <StatCell label="Move ref" value={move.reference} />
            </dl>
          </section>

          {locations ? (
            <section>
              <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3 w-3" />
                Route
              </p>
              <dl className="space-y-2 text-sm text-slate-800">
                <div>
                  <dt className="text-[10px] font-medium uppercase text-slate-500">From</dt>
                  <dd className="mt-0.5 leading-snug">{locations.origin}</dd>
                </div>
                {locations.stops ? (
                  <div>
                    <dt className="text-[10px] font-medium uppercase text-slate-500">Stops</dt>
                    <dd className="mt-0.5 leading-snug">{locations.stops}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] font-medium uppercase text-slate-500">To</dt>
                  <dd className="mt-0.5 leading-snug">{locations.destination}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {jobDay.services?.length ? (
            <StatCell
              label="Services this day"
              value={jobDay.services.map(serviceLabel).join(", ")}
              multiline
            />
          ) : null}

          {jobDay.accessNotes || jobDay.dispatchNotes ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
                <ClipboardList className="h-3 w-3" aria-hidden />
                Dispatch / access notes
              </p>
              <p className="mt-1 text-sm leading-snug text-sky-950">
                {[jobDay.accessNotes, jobDay.dispatchNotes].filter(Boolean).join("\n\n")}
              </p>
            </div>
          ) : null}

          {jobDay.customerNotes ? (
            <StatCell label="Customer notes" value={jobDay.customerNotes} multiline />
          ) : null}

          <Link
            href={salesMovePath(move.id)}
            className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Open full move record →
          </Link>
        </div>
      ) : null}
    </DetailSidebar>
  );
}

function StatCell({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={
          multiline
            ? "mt-0.5 text-sm leading-snug text-slate-800"
            : "mt-0.5 truncate text-sm font-medium text-slate-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
