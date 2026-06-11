"use client";

import { JobFieldPacketSidebar } from "@/components/operations/jobs/JobFieldPacketSidebar";
import { OpsJobDaySidebar } from "@/components/operations/jobs/OpsJobDaySidebar";
import { JobsDayToolbar } from "@/components/operations/jobs/JobsDayToolbar";
import { JobsList } from "@/components/operations/jobs/JobsList";
import { OpsPrepPanel } from "@/components/operations/jobs/OpsPrepPanel";
import { toDateKey } from "@/lib/calendar/date-utils";
import { getJobFieldPacket } from "@/lib/operations/job-field-packet";
import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import { useMoves } from "@/components/moves/MovesProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import {
  collectOpsJobDays,
  defaultSelectedDateForBrowse,
  filterOpsJobDays,
  opsJobsViewLabel,
  type OpsJobsView,
} from "@/lib/operations/ops-jobs";
import { collectOpsPrepTasks } from "@/lib/operations/ops-prep-tasks";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useEffect, useMemo, useState } from "react";

const meta = pageMeta["/operations/jobs"];

function normalizeView(stored: string): OpsJobsView {
  if (stored === "past" || stored === "today" || stored === "tomorrow" || stored === "date") {
    return stored;
  }
  return "today";
}

export function JobsWorkspace() {
  const { moves } = useMoves();
  const today = useMemo(() => new Date(), []);
  const [storedView, setStoredView] = usePersistedState<string>(
    "jm-tab-/operations/jobs-view",
    "today",
  );
  const [view, setView] = useState<OpsJobsView>(() => normalizeView(storedView));
  const [selectedDateKey, setSelectedDateKey] = usePersistedState(
    "jm-ops-jobs-date",
    defaultSelectedDateForBrowse(today),
  );
  const [packetRow, setPacketRow] = useState<OpsJobDayRow | null>(null);
  const [selectedJobRow, setSelectedJobRow] = useState<OpsJobDayRow | null>(null);

  const allRows = useMemo(() => collectOpsJobDays(moves), [moves]);
  const filteredRows = useMemo(
    () => filterOpsJobDays(allRows, view, today, selectedDateKey),
    [allRows, view, today, selectedDateKey],
  );
  const prepTasks = useMemo(() => collectOpsPrepTasks(moves, today), [moves, today]);

  useEffect(() => {
    setView(normalizeView(storedView));
  }, [storedView]);

  useEffect(() => {
    setSelectedJobRow(null);
  }, [selectedDateKey, view]);

  useEffect(() => {
    if (selectedJobRow && !filteredRows.some((r) => r.id === selectedJobRow.id)) {
      setSelectedJobRow(null);
    }
  }, [filteredRows, selectedJobRow]);

  function changeView(next: OpsJobsView) {
    setView(next);
    setStoredView(next);
    setSelectedJobRow(null);
  }

  const todayKey = toDateKey(today);
  const showFieldPackets =
    view === "past" || (view === "date" && !!selectedDateKey && selectedDateKey < todayKey);

  const useJobDaySidebar = true;

  const openPacket = useMemo(() => {
    if (!packetRow) return null;
    const move = moves.find((m) => m.id === packetRow.moveId);
    return getJobFieldPacket(packetRow, move);
  }, [packetRow, moves]);

  const emptyMessage =
    view === "past"
      ? "No completed job days in the past few weeks."
      : view === "today"
        ? "No booked jobs for today."
        : view === "tomorrow"
          ? "No booked jobs for tomorrow."
          : selectedDateKey && selectedDateKey < toDateKey(today)
            ? `No completed jobs on ${opsJobsViewLabel("date", today, selectedDateKey)}.`
            : `No booked jobs on ${opsJobsViewLabel("date", today, selectedDateKey)}.`;

  return (
    <div className="space-y-4">
      <PageHeader title={meta.title} description={meta.description} />

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(17rem,22rem)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <JobsDayToolbar
            view={view}
            onViewChange={changeView}
            selectedDateKey={selectedDateKey}
            onSelectedDateChange={setSelectedDateKey}
            jobCount={filteredRows.length}
          />
          <JobsList
            rows={filteredRows}
            moves={moves}
            emptyMessage={emptyMessage}
            showDateColumn={view === "past" || view === "date"}
            showFieldPackets={showFieldPackets}
            groupByJobDayStatus={view === "today"}
            onOpenFieldPacket={showFieldPackets ? setPacketRow : undefined}
            onSelectJob={useJobDaySidebar ? setSelectedJobRow : undefined}
            selectedJobId={selectedJobRow?.id ?? null}
          />
          {showFieldPackets ? (
            <p className="text-xs text-slate-500">
              Completed jobs include forms, signatures, and payment from the crew app — open{" "}
              <span className="font-medium">Field packet</span> to review.
            </p>
          ) : null}
        </div>

        <OpsPrepPanel tasks={prepTasks} />
      </div>

      <JobFieldPacketSidebar packet={openPacket} onClose={() => setPacketRow(null)} />

      <OpsJobDaySidebar
        row={selectedJobRow}
        move={
          selectedJobRow
            ? moves.find((m) => m.id === selectedJobRow.moveId)
            : undefined
        }
        onClose={() => setSelectedJobRow(null)}
      />
    </div>
  );
}
