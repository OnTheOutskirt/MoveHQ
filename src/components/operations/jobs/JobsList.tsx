"use client";

import {
  DayBeforeConfirmationPill,
  useOpsJobDayConfirmation,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import { formatMoveDate } from "@/lib/moves/format";
import {
  getJobFieldPacket,
  jobFieldPacketSummary,
} from "@/lib/operations/job-field-packet";
import { CrewFeedbackRatingBadge } from "@/components/operations/jobs/CrewFeedbackDisplay";
import { crewFeedbackForOpsJobRow } from "@/lib/moves/move-feedback-portal";
import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import type { JobDayStatus, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { FileText, MapPin } from "lucide-react";
import { useMemo } from "react";

type JobsListProps = {
  rows: OpsJobDayRow[];
  moves: MoveRecord[];
  emptyMessage: string;
  showDateColumn?: boolean;
  showFieldPackets?: boolean;
  onOpenFieldPacket?: (row: OpsJobDayRow) => void;
  /** Opens ops job-day sidebar instead of navigating to the move. */
  onSelectJob?: (row: OpsJobDayRow) => void;
  selectedJobId?: string | null;
  /** Group today's list under Scheduled / In progress / Completed headers. */
  groupByJobDayStatus?: boolean;
};

const TODAY_STATUS_GROUP_ORDER: JobDayStatus[] = ["scheduled", "in_progress", "completed"];

function JobRowConfirmation({ row, move }: { row: OpsJobDayRow; move?: MoveRecord }) {
  const { confirmation } = useOpsJobDayConfirmation(row, move);
  if (!confirmation || confirmation.status === "not_due") return null;
  return (
    <DayBeforeConfirmationPill
      jobId={row.id}
      confirmation={confirmation}
      compact
      className="shrink-0"
    />
  );
}

type JobsListRowProps = {
  row: OpsJobDayRow;
  move?: MoveRecord;
  showDateColumn?: boolean;
  showFieldPackets?: boolean;
  onOpenFieldPacket?: (row: OpsJobDayRow) => void;
  onSelectJob?: (row: OpsJobDayRow) => void;
  selectedJobId?: string | null;
};

function JobsListRow({
  row,
  move,
  showDateColumn,
  showFieldPackets,
  onOpenFieldPacket,
  onSelectJob,
  selectedJobId,
}: JobsListRowProps) {
  const statusStyle = jobDayStatusConfig[row.status];
  const crewFeedback = crewFeedbackForOpsJobRow(move, row);
  const packet =
    showFieldPackets && onOpenFieldPacket ? getJobFieldPacket(row, move) : null;
  const selected = selectedJobId === row.id;
  const useSidebar = Boolean(onSelectJob);

  const rowBody = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{row.customerName}</p>
          <Badge className={statusStyle.badge}>{jobDayStatusLabel(row.status)}</Badge>
          {crewFeedback ? <CrewFeedbackRatingBadge feedback={crewFeedback} /> : null}
          <span className="text-xs text-slate-500">{row.dayLabel}</span>
        </div>
        <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-600">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span className="line-clamp-2">
            {row.origin} → {row.destination}
          </span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          {row.crewLine ? <span>{row.crewLine}</span> : null}
          {row.truckLine ? <span>{row.truckLine}</span> : null}
          {row.arrivalWindow ? <span>Arrive {row.arrivalWindow}</span> : null}
          {row.durationLabel ? <span>{row.durationLabel}</span> : null}
        </div>
      </div>
      <div className={cn("shrink-0 text-right text-xs", showDateColumn && "sm:min-w-[7rem]")}>
        {showDateColumn ? (
          <p className="font-medium text-slate-800">{formatMoveDate(row.date)}</p>
        ) : null}
        <p className="text-slate-500">{row.moveType}</p>
      </div>
    </>
  );

  return (
    <li className="flex flex-col sm:flex-row sm:items-stretch">
      {useSidebar ? (
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start gap-2 px-4 py-3 sm:gap-3",
            selected ? "bg-brand-50/80" : "",
          )}
        >
          <button
            type="button"
            onClick={() => onSelectJob?.(row)}
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-2 text-left transition-colors sm:flex-row sm:items-start sm:justify-between",
              !selected && "hover:bg-slate-50",
            )}
          >
            {rowBody}
          </button>
          <JobRowConfirmation row={row} move={move} />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          {rowBody}
        </div>
      )}

      {packet && onOpenFieldPacket ? (
        <div className="flex shrink-0 flex-col items-stretch justify-center border-t border-slate-100 px-4 py-2 sm:w-[9.5rem] sm:border-l sm:border-t-0 sm:py-3 sm:pl-3 sm:pr-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFieldPacket(row);
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            Field packet
          </Button>
          <p className="mt-1 text-center text-[10px] leading-snug text-slate-500 sm:text-left">
            {jobFieldPacketSummary(packet)}
          </p>
        </div>
      ) : null}
    </li>
  );
}

function JobsListItems({
  rows,
  moveById,
  ...rowProps
}: Omit<JobsListRowProps, "row" | "move"> & {
  rows: OpsJobDayRow[];
  moveById: Map<string, MoveRecord>;
}) {
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {rows.map((row) => (
        <JobsListRow key={row.id} row={row} move={moveById.get(row.moveId)} {...rowProps} />
      ))}
    </ul>
  );
}

function groupRowsByStatus(rows: OpsJobDayRow[]): {
  groups: { status: JobDayStatus; rows: OpsJobDayRow[] }[];
  other: OpsJobDayRow[];
} {
  const buckets = new Map<JobDayStatus, OpsJobDayRow[]>(
    TODAY_STATUS_GROUP_ORDER.map((s) => [s, []]),
  );
  const other: OpsJobDayRow[] = [];
  for (const row of rows) {
    const list = buckets.get(row.status);
    if (list) list.push(row);
    else other.push(row);
  }
  const groups = TODAY_STATUS_GROUP_ORDER.map((status) => ({
    status,
    rows: buckets.get(status) ?? [],
  })).filter((g) => g.rows.length > 0);
  return { groups, other };
}

export function JobsList({
  rows,
  moves,
  emptyMessage,
  showDateColumn,
  showFieldPackets,
  onOpenFieldPacket,
  onSelectJob,
  selectedJobId,
  groupByJobDayStatus = false,
}: JobsListProps) {
  const moveById = useMemo(() => new Map(moves.map((m) => [m.id, m])), [moves]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  const rowProps = {
    showDateColumn,
    showFieldPackets,
    onOpenFieldPacket,
    onSelectJob,
    selectedJobId,
  };

  if (!groupByJobDayStatus) {
    return <JobsListItems rows={rows} moveById={moveById} {...rowProps} />;
  }

  const { groups, other } = groupRowsByStatus(rows);

  return (
    <div className="space-y-4">
      {groups.map(({ status, rows: groupRows }) => (
        <section key={status}>
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {jobDayStatusLabel(status)}
            <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-bold tabular-nums text-slate-600">
              {groupRows.length}
            </span>
          </h2>
          <JobsListItems rows={groupRows} moveById={moveById} {...rowProps} />
        </section>
      ))}
      {other.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Other
          </h2>
          <JobsListItems rows={other} moveById={moveById} {...rowProps} />
        </section>
      ) : null}
    </div>
  );
}
