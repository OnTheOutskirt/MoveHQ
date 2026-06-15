"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import { PayrollExportTab } from "@/components/payroll/PayrollExportTab";
import { PayrollTimeOffTab } from "@/components/payroll/PayrollTimeOffTab";
import { TimeEntriesTab } from "@/components/payroll/TimeEntriesTab";
import { TipsEntriesTab } from "@/components/payroll/TipsEntriesTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { buildRollingMockTimeEntries } from "@/lib/payroll/mock-time-entries";
import { buildRollingMockTipEntries } from "@/lib/payroll/mock-tip-entries";
import {
  mergeOfficeClockIntoEntries,
  subscribeOfficeClock,
} from "@/lib/payroll/office-time-clock-storage";
import { normalizeTimeEntry } from "@/lib/payroll/time-entry-utils";
import type { TimeEntry, TipEntry } from "@/lib/payroll/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useCallback, useEffect, useState } from "react";

const meta = pageMeta["/operations/payroll"];

type PayrollTab = "time" | "tips" | "time-off" | "payroll";

export function PayrollTimeWorkspace() {
  const { can } = useCapabilities();
  const canApprove = can("payroll.approve");

  const tabs = [
    can("payroll.view") ? ({ id: "time" as const, label: "Time entries" }) : null,
    can("payroll.view") ? ({ id: "tips" as const, label: "Tips" }) : null,
    can("payroll.view") ? ({ id: "time-off" as const, label: "Time off" }) : null,
    can("payroll.export") ? ({ id: "payroll" as const, label: "Payroll export" }) : null,
  ].filter((t): t is { id: PayrollTab; label: string } => t != null);

  const clientReady = useClientReady();
  const [tab, setTab] = usePersistedState<PayrollTab>(
    "jm-tab-/operations/payroll",
    tabs[0]?.id ?? "time",
  );
  const [entries, setEntries] = useState<TimeEntry[]>(() => buildRollingMockTimeEntries());
  const [tips, setTips] = useState<TipEntry[]>(() => buildRollingMockTipEntries());

  useEffect(() => {
    if (!clientReady) return;
    const sync = () => {
      setEntries(mergeOfficeClockIntoEntries(buildRollingMockTimeEntries()));
      setTips(buildRollingMockTipEntries());
    };
    sync();
    const unsub = subscribeOfficeClock(sync);
    const intervalId = window.setInterval(sync, 30_000);
    return () => {
      unsub();
      window.clearInterval(intervalId);
    };
  }, [clientReady]);

  const onUpdateEntry = useCallback((id: string, patch: Partial<TimeEntry>) => {
    if (!canApprove) return;
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const merged = { ...e, ...patch, source: "manager_edit" as const };
        return patch.categories ? normalizeTimeEntry(merged) : merged;
      }),
    );
  }, [canApprove]);

  const onBulkApproveEntries = useCallback((ids: string[]) => {
    if (!canApprove) return;
    const idSet = new Set(ids);
    setEntries((prev) =>
      prev.map((e) => (idSet.has(e.id) ? { ...e, status: "approved" as const } : e)),
    );
  }, [canApprove]);

  const onAddEntry = useCallback((entry: TimeEntry) => {
    if (!canApprove) return;
    setEntries((prev) => [...prev, entry]);
  }, [canApprove]);

  const onDeleteEntry = useCallback((id: string) => {
    if (!canApprove) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [canApprove]);

  const onUpdateTip = useCallback((id: string, patch: Partial<TipEntry>) => {
    if (!canApprove) return;
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, [canApprove]);

  const onBulkApproveTips = useCallback((ids: string[]) => {
    if (!canApprove) return;
    const idSet = new Set(ids);
    setTips((prev) =>
      prev.map((t) => (idSet.has(t.id) ? { ...t, status: "approved" as const } : t)),
    );
  }, [canApprove]);

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
      <PageHeader title={meta.title} description={meta.description || undefined} />

      {tabs.length > 1 ? (
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setTab} />
      ) : null}

      {activeTab === "time" ? (
        <TimeEntriesTab
          entries={entries}
          onUpdateEntry={onUpdateEntry}
          onBulkApproveEntries={onBulkApproveEntries}
          onAddEntry={onAddEntry}
          onDeleteEntry={onDeleteEntry}
          canApprove={canApprove}
        />
      ) : activeTab === "tips" ? (
        <TipsEntriesTab
          tips={tips}
          onUpdateTip={onUpdateTip}
          onBulkApproveTips={onBulkApproveTips}
          canApprove={canApprove}
        />
      ) : activeTab === "time-off" ? (
        <PayrollTimeOffTab />
      ) : (
        <PayrollExportTab
          allEntries={entries}
          allTips={tips}
        />
      )}
    </div>
  );
}
