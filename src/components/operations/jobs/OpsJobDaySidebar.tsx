"use client";

import {
  DayBeforeConfirmationPill,
  useOpsJobDayConfirmation,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import { PricingTypeBadge } from "@/components/moves/detail/PricingTypeBadge";
import { JobFieldPacketPanel } from "@/components/operations/jobs/JobFieldPacketPanel";
import { OpsJobDayInventoryAccordion } from "@/components/operations/jobs/OpsJobDayInventoryAccordion";
import { OpsJobDayOpsPanel } from "@/components/operations/jobs/OpsJobDayOpsPanel";
import { OpsJobDayRouteMap } from "@/components/operations/jobs/OpsJobDayRouteMap";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate, formatQuote } from "@/lib/moves/format";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import {
  jobDayLocationLines,
  jobDayCrewLine,
  jobDayTruckLine,
  serviceLabel,
} from "@/lib/moves/job-day-display";
import { getJobFieldPacket } from "@/lib/operations/job-field-packet";
import { resolveJobDayForOpsRow, type OpsJobDayRow } from "@/lib/operations/ops-jobs";
import {
  readOpsConfirmationNote,
  subscribeOpsConfirmationNotes,
  writeOpsConfirmationNote,
} from "@/lib/operations/ops-confirmation-notes";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { CrewFeedbackDetailSection } from "@/components/operations/jobs/CrewFeedbackDisplay";
import { crewFeedbackForOpsJobRow } from "@/lib/moves/move-feedback-portal";
import {
  DirectoryContactActionSidebar,
  type DirectoryContactTarget,
} from "@/components/people/DirectoryContactActionSidebar";
import type { DirectoryContactChannel } from "@/lib/people/contact-communication-history";
import { ClipboardList, MapPin, MessageSquare, Phone, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const PAST_SIDEBAR_TABS = [
  { id: "overview", label: "Overview" },
  { id: "field-packet", label: "Field packet" },
] as const;

type PastSidebarTab = (typeof PAST_SIDEBAR_TABS)[number]["id"];

type OpsJobDaySidebarProps = {
  row: OpsJobDayRow | null;
  move: MoveRecord | undefined;
  onClose: () => void;
  /** Past / completed job days — show field packet tab instead of list column. */
  pastMode?: boolean;
};

export function OpsJobDaySidebar({ row, move, onClose, pastMode = false }: OpsJobDaySidebarProps) {
  const { confirmation } = useOpsJobDayConfirmation(row ?? undefined, move);
  const [callNotes, setCallNotes] = useState("");
  const [activeTab, setActiveTab] = useState<PastSidebarTab>("overview");

  const jobDay = useMemo(
    () => (row && move ? resolveJobDayForOpsRow(move, row) : undefined),
    [row, move],
  );

  const locations = useMemo(
    () => (move && jobDay ? jobDayLocationLines(move, jobDay) : null),
    [move, jobDay],
  );

  const crewFeedback = useMemo(
    () => (row && move ? crewFeedbackForOpsJobRow(move, row) : null),
    [row, move],
  );

  const fieldPacket = useMemo(
    () => (row && move && pastMode ? getJobFieldPacket(row, move) : null),
    [row, move, pastMode],
  );

  const scheduledJobDays = useMemo(() => {
    if (!move) return [];
    return move.jobDays
      .filter((day) => day.status !== "cancelled" && day.status !== "proposed")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [move]);

  const isMultiDay = scheduledJobDays.length > 1;

  useEffect(() => {
    if (!row) return;
    setActiveTab("overview");
    setCallNotes(readOpsConfirmationNote(row.id));
    return subscribeOpsConfirmationNotes(() => {
      setCallNotes(readOpsConfirmationNote(row.id));
    });
  }, [row]);

  const open = Boolean(row);
  const statusStyle = row ? jobDayStatusConfig[row.status] : null;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={row?.customerName ?? "Job day"}
      description={
        row
          ? `${row.dayLabel} · ${formatMoveDate(row.date)} · ${move?.reference ?? row.moveType}`
          : undefined
      }
      headerBelow={
        row && statusStyle ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusStyle.badge}>{jobDayStatusLabel(row.status)}</Badge>
            {move ? <PricingTypeBadge quoteType={move.quoteType} /> : null}
            {move?.quoteAmount != null ? (
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {formatQuote(move.quoteAmount, move.quoteType)}
              </span>
            ) : null}
          </div>
        ) : null
      }
      widthClassName="max-w-xl"
    >
      {row && move && jobDay ? (
        <div className="space-y-4">
          {pastMode ? (
            <TabBar tabs={PAST_SIDEBAR_TABS} activeTab={activeTab} onChange={setActiveTab} />
          ) : null}

          {activeTab === "field-packet" && pastMode ? (
            fieldPacket ? (
              <JobFieldPacketPanel packet={fieldPacket} move={move} />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No field packet on file for this job day yet.
              </p>
            )
          ) : (
            <OverviewContent
              row={row}
              move={move}
              jobDay={jobDay}
              locations={locations}
              crewFeedback={crewFeedback}
              confirmation={confirmation}
              callNotes={callNotes}
              setCallNotes={setCallNotes}
              isMultiDay={isMultiDay}
              scheduledJobDays={scheduledJobDays}
            />
          )}

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

function OverviewContent({
  row,
  move,
  jobDay,
  locations,
  crewFeedback,
  confirmation,
  callNotes,
  setCallNotes,
  isMultiDay,
  scheduledJobDays,
}: {
  row: OpsJobDayRow;
  move: MoveRecord;
  jobDay: MoveJobDay;
  locations: ReturnType<typeof jobDayLocationLines> | null;
  crewFeedback: ReturnType<typeof crewFeedbackForOpsJobRow>;
  confirmation: ReturnType<typeof useOpsJobDayConfirmation>["confirmation"];
  callNotes: string;
  setCallNotes: (value: string) => void;
  isMultiDay: boolean;
  scheduledJobDays: MoveJobDay[];
}) {
  const [contactAction, setContactAction] = useState<DirectoryContactChannel | null>(null);

  const contactTarget: DirectoryContactTarget = {
    name: move.customerName,
    phone: move.customerPhone,
    email: move.customerEmail,
    moveIds: [move.id],
  };

  return (
    <>
      {crewFeedback ? <CrewFeedbackDetailSection feedback={crewFeedback} /> : null}

      {confirmation ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              Confirmation call
            </p>
            <DayBeforeConfirmationPill jobId={row.id} confirmation={confirmation} />
          </div>
          <p className="mt-2 text-sm text-amber-950">{confirmation.detail}</p>
          {move.customerPhone ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setContactAction("call")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden />
                Call
              </button>
              <button
                type="button"
                onClick={() => setContactAction("sms")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                Text
              </button>
              <span className="inline-flex items-center text-xs font-medium text-amber-800">
                {move.customerPhone}
              </span>
            </div>
          ) : null}
          <ConfirmationCallNotesInput
            id={`ops-call-notes-${row.id}`}
            value={callNotes}
            onChange={(value) => {
              setCallNotes(value);
              writeOpsConfirmationNote(row.id, value);
            }}
          />
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <dl className="grid gap-3 sm:grid-cols-2">
          <StatCell label="Job type" value={row.moveType} />
          <StatCell
            label="Pricing"
            value={formatQuote(move.quoteAmount, move.quoteType)}
          />
          {jobDay.services?.length ? (
            <StatCell
              label="Services this day"
              value={jobDay.services.map(serviceLabel).join(", ")}
              multiline
              className="sm:col-span-2"
            />
          ) : null}
          {isMultiDay ? (
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Multi-day move · {scheduledJobDays.length} job days
              </dt>
              <dd className="mt-1 space-y-1">
                {scheduledJobDays.map((day) => (
                  <p
                    key={day.id}
                    className={
                      day.id === jobDay.id
                        ? "text-sm font-medium text-brand-800"
                        : "text-sm text-slate-700"
                    }
                  >
                    {day.label} · {formatMoveDate(day.date)}
                    {day.id === jobDay.id ? " (this day)" : ""}
                  </p>
                ))}
              </dd>
            </div>
          ) : (
            <StatCell label="Move date" value={formatMoveDate(row.date)} />
          )}
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <StatCell label="Departure" value={jobDay.departureWindow ?? "—"} />
          <StatCell label="Arrival" value={jobDay.arrivalWindow ?? row.arrivalWindow ?? "—"} />
          <StatCell label="Duration" value={jobDay.durationLabel ?? row.durationLabel ?? "—"} />
          <StatCell label="Crew" value={jobDayCrewLine(jobDay) ?? row.crewLine ?? "—"} />
          <StatCell label="Trucks" value={jobDayTruckLine(jobDay) ?? row.truckLine ?? "—"} />
          <StatCell label="Move ref" value={move.reference} />
        </dl>
      </section>

      <OpsJobDayInventoryAccordion move={move} />

      <OpsJobDayOpsPanel
        move={move}
        jobDay={jobDay}
        onDriveHoursChange={() => undefined}
        hideDriveSection
        sidebarLayout
      />

      {locations ? (
        <section className="space-y-3">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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
          <OpsJobDayRouteMap jobDay={jobDay} />
        </section>
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

      <DirectoryContactActionSidebar
        target={contactTarget}
        action={contactAction}
        onClose={() => setContactAction(null)}
      />
    </>
  );
}

function ConfirmationCallNotesInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      value={value}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Call notes — who you spoke with, time, voicemail…"
      className="mt-3 w-full resize-none overflow-hidden rounded-md border border-amber-200/80 bg-white/60 px-2.5 py-1.5 text-sm leading-snug text-amber-950 placeholder:text-amber-800/50 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
    />
  );
}

function StatCell({
  label,
  value,
  multiline,
  className,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
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
