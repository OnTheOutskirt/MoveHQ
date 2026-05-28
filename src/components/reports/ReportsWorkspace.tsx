"use client";

import { DayPipelineReport } from "@/components/reports/DayPipelineReport";
import { PlaceholderReport } from "@/components/reports/PlaceholderReport";
import { TabBar } from "@/components/shared/TabBar";
import { ModulePage } from "@/components/shared/ModulePage";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const REPORT_TABS = [
  { id: "day", label: "Day report" },
  { id: "pipeline", label: "Pipeline summary" },
  { id: "revenue", label: "Revenue" },
  { id: "operations", label: "Operations" },
] as const;

type ReportTabId = (typeof REPORT_TABS)[number]["id"];

function isReportTab(value: string | null): value is ReportTabId {
  return REPORT_TABS.some((t) => t.id === value);
}

export function ReportsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = pageMeta["/operations/reports"];

  const rawTab = searchParams.get("tab");
  const activeTab: ReportTabId = isReportTab(rawTab) ? rawTab : "day";

  const date = useMemo(() => {
    const raw = searchParams.get("date");
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return parseDateKey(raw);
    }
    return new Date();
  }, [searchParams]);

  const today = useMemo(() => new Date(), []);
  const dayData = useMemo(() => buildMockDay(date, today), [date, today]);

  function setTab(tab: ReportTabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab === "day" && !params.has("date")) {
      params.set("date", toDateKey(date));
    }
    router.push(`/operations/reports?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={REPORT_TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "day" && <DayPipelineReport date={date} sales={dayData.sales} />}
      {activeTab === "pipeline" && (
        <PlaceholderReport
          title="Pipeline summary"
          description="Rolling view of leads, proposals, and bookings across a week or custom range."
        />
      )}
      {activeTab === "revenue" && (
        <PlaceholderReport
          title="Revenue"
          description="Booked and collected revenue by day, rep, and move type."
        />
      )}
      {activeTab === "operations" && (
        <PlaceholderReport
          title="Operations"
          description="Crew and truck utilization, job-day completion, and capacity vs actuals."
        />
      )}
    </div>
  );
}
