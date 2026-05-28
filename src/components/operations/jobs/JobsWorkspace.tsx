"use client";

import { JobsDayToolbar } from "@/components/operations/jobs/JobsDayToolbar";
import { JobsList } from "@/components/operations/jobs/JobsList";
import { OpsPrepPanel } from "@/components/operations/jobs/OpsPrepPanel";
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

  const allRows = useMemo(() => collectOpsJobDays(moves), [moves]);
  const filteredRows = useMemo(
    () => filterOpsJobDays(allRows, view, today, selectedDateKey),
    [allRows, view, today, selectedDateKey],
  );
  const prepTasks = useMemo(() => collectOpsPrepTasks(moves, today), [moves, today]);

  useEffect(() => {
    setView(normalizeView(storedView));
  }, [storedView]);

  function changeView(next: OpsJobsView) {
    setView(next);
    setStoredView(next);
  }

  const emptyMessage =
    view === "past"
      ? "No job days in the past few weeks."
      : view === "today"
        ? "Nothing scheduled for today."
        : view === "tomorrow"
          ? "Nothing scheduled for tomorrow."
          : `No job days on ${opsJobsViewLabel("date", today, selectedDateKey)}.`;

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
            emptyMessage={emptyMessage}
            showDateColumn={view === "past" || view === "date"}
          />
        </div>

        <OpsPrepPanel tasks={prepTasks} />
      </div>
    </div>
  );
}
