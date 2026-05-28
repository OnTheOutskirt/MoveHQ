"use client";

import { PayrollExportTab } from "@/components/payroll/PayrollExportTab";
import { TimeEntriesTab } from "@/components/payroll/TimeEntriesTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { MOCK_TIME_ENTRIES } from "@/lib/payroll/mock-time-entries";
import type { TimeEntry } from "@/lib/payroll/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useCallback, useState } from "react";

const meta = pageMeta["/operations/payroll"];

const TABS = [
  { id: "time" as const, label: "Time entries" },
  { id: "payroll" as const, label: "Payroll export" },
];

export function PayrollTimeWorkspace() {
  const [tab, setTab] = usePersistedState<(typeof TABS)[number]["id"]>(
    "jm-tab-/operations/payroll",
    "time",
  );
  const [entries, setEntries] = useState<TimeEntry[]>(() => [...MOCK_TIME_ENTRIES]);

  const onUpdateEntry = useCallback((id: string, patch: Partial<TimeEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, source: "manager_edit" as const } : e)),
    );
  }, []);

  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />

      <Card className="border-slate-200 bg-slate-50/80">
        <CardContent className="grid gap-3 py-4 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">Operations</p>
            <p className="mt-1 text-slate-600">
              Approve crew and office time, fix clock issues, and review tips and mileage before pay
              period close — {pendingCount} pending in demo data.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Office / HR</p>
            <p className="mt-1 text-slate-600">
              Use the Payroll export tab for the Rippling CSV each period. V2 will push via API
              instead of manual upload.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Why it lives under Operations</p>
            <p className="mt-1 text-slate-600">
              Daily time approval sits next to crew and jobs. Permissions can later hide payroll
              export from ops roles and limit it to HR.
            </p>
          </div>
        </CardContent>
      </Card>

      <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === "time" ? (
        <TimeEntriesTab entries={entries} onUpdateEntry={onUpdateEntry} />
      ) : (
        <PayrollExportTab entries={entries.filter((e) => e.status === "approved")} />
      )}
    </div>
  );
}
