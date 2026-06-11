"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import { PayrollExportTab } from "@/components/payroll/PayrollExportTab";
import { TimeEntriesTab } from "@/components/payroll/TimeEntriesTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { buildRollingMockTimeEntries } from "@/lib/payroll/mock-time-entries";
import {
  mergeOfficeClockIntoEntries,
  subscribeOfficeClock,
} from "@/lib/payroll/office-time-clock-storage";
import { normalizeTimeEntry } from "@/lib/payroll/time-entry-utils";
import type { TimeEntry } from "@/lib/payroll/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useCallback, useEffect, useMemo, useState } from "react";

const meta = pageMeta["/operations/payroll"];

export function PayrollTimeWorkspace() {
  const { can } = useCapabilities();
  const tabs = [
    can("payroll.view") ? ({ id: "time" as const, label: "Time entries" }) : null,
    can("payroll.export") ? ({ id: "payroll" as const, label: "Payroll export" }) : null,
  ].filter((t): t is { id: "time" | "payroll"; label: string } => t != null);

  const clientReady = useClientReady();
  const [tab, setTab] = usePersistedState<"time" | "payroll">(
    "jm-tab-/operations/payroll",
    tabs[0]?.id ?? "time",
  );
  const [entries, setEntries] = useState<TimeEntry[]>(() => buildRollingMockTimeEntries());

  useEffect(() => {
    if (!clientReady) return;
    const sync = () => setEntries(mergeOfficeClockIntoEntries(buildRollingMockTimeEntries()));
    sync();
    const unsub = subscribeOfficeClock(sync);
    const intervalId = window.setInterval(sync, 30_000);
    return () => {
      unsub();
      window.clearInterval(intervalId);
    };
  }, [clientReady]);

  const onUpdateEntry = useCallback((id: string, patch: Partial<TimeEntry>) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const merged = { ...e, ...patch, source: "manager_edit" as const };
        return patch.categories ? normalizeTimeEntry(merged) : merged;
      }),
    );
  }, []);

  const pendingCount = useMemo(
    () => entries.filter((e) => e.status === "pending").length,
    [entries],
  );

  const activeTab = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id ?? "time");

  if (tabs.length === 0) {
    return (
      <AccessDenied
        title="Payroll access required"
        description="Your role doesn't include payroll or time approval. An admin can grant this on your staff profile."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />

      <Card className="border-slate-200 bg-slate-50/80">
        <CardContent className="grid gap-3 py-4 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-900">Weekly review</p>
            <p className="mt-1 text-slate-600">
              Crew hours roll up from the crew app (move, drive, extra, break). Hourly office staff
              clock in from the header time clock — office hours land here as pending until approved.
              Click a cell to review and approve before payroll export — {pendingCount} pending in
              demo data.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Payroll export</p>
            <p className="mt-1 text-slate-600">
              Approved hours export to Rippling CSV by pay period. Crew app and office time clock
              sync here when live.
            </p>
          </div>
        </CardContent>
      </Card>

      {tabs.length > 1 ? (
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setTab} />
      ) : null}

      {activeTab === "time" ? (
        <TimeEntriesTab entries={entries} onUpdateEntry={onUpdateEntry} />
      ) : (
        <PayrollExportTab entries={entries.filter((e) => e.status === "approved")} />
      )}
    </div>
  );
}
