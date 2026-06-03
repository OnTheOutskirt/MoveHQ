"use client";

import { AiQuotesAccuracyReport } from "@/components/reports/AiQuotesAccuracyReport";
import { BudgetActualsReport } from "@/components/reports/BudgetActualsReport";
import { CommissionReport } from "@/components/reports/CommissionReport";
import { DayPipelineReport } from "@/components/reports/DayPipelineReport";
import { DispatchChangeImpactReport } from "@/components/reports/DispatchChangeImpactReport";
import { LaborHoursReport } from "@/components/reports/LaborHoursReport";
import { SalesRevenueReport } from "@/components/reports/SalesRevenueReport";
import { SpeedToLeadReport } from "@/components/reports/SpeedToLeadReport";
import { TabBar } from "@/components/shared/TabBar";
import { ModulePage } from "@/components/shared/ModulePage";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const CATEGORY_TABS = [
  { id: "day", label: "Day report" },
  { id: "sales", label: "Sales" },
  { id: "operations", label: "Operations" },
  { id: "ai-quotes", label: "AI quotes" },
] as const;

const SALES_REPORT_TABS = [
  { id: "speed-to-lead", label: "Speed to lead" },
  { id: "revenue", label: "Revenue booked" },
  { id: "commission", label: "Commission" },
] as const;

const OPERATIONS_REPORT_TABS = [
  { id: "labor-hours", label: "Labor hours" },
  { id: "budget-actuals", label: "Budget vs actuals" },
  { id: "dispatch-changes", label: "Dispatch changes" },
] as const;

type CategoryTabId = (typeof CATEGORY_TABS)[number]["id"];
type SalesReportId = (typeof SALES_REPORT_TABS)[number]["id"];
type OperationsReportId = (typeof OPERATIONS_REPORT_TABS)[number]["id"];

function isCategoryTab(value: string | null): value is CategoryTabId {
  return CATEGORY_TABS.some((t) => t.id === value);
}

function isSalesReport(value: string | null): value is SalesReportId {
  return SALES_REPORT_TABS.some((t) => t.id === value);
}

function isOperationsReport(value: string | null): value is OperationsReportId {
  return OPERATIONS_REPORT_TABS.some((t) => t.id === value);
}

export function ReportsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = pageMeta["/operations/reports"];

  const rawTab = searchParams.get("tab");
  const activeCategory: CategoryTabId = isCategoryTab(rawTab) ? rawTab : "day";

  const rawReport = searchParams.get("report");
  const salesReport: SalesReportId = isSalesReport(rawReport) ? rawReport : "speed-to-lead";
  const operationsReport: OperationsReportId = isOperationsReport(rawReport)
    ? rawReport
    : "labor-hours";

  const date = useMemo(() => {
    const raw = searchParams.get("date");
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return parseDateKey(raw);
    }
    return new Date();
  }, [searchParams]);

  const today = useMemo(() => new Date(), []);
  const dayData = useMemo(() => buildMockDay(date, today), [date, today]);

  function pushParams(next: { tab: CategoryTabId; report?: string; keepDate?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next.tab);
    if (next.report) {
      params.set("report", next.report);
    } else {
      params.delete("report");
    }
    if (next.tab === "day") {
      if (next.keepDate !== false && !params.has("date")) {
        params.set("date", toDateKey(date));
      }
    } else {
      params.delete("date");
    }
    router.push(`/operations/reports?${params.toString()}`, { scroll: false });
  }

  function setCategory(tab: CategoryTabId) {
    if (tab === "sales") {
      pushParams({ tab, report: salesReport });
      return;
    }
    if (tab === "operations") {
      pushParams({ tab, report: operationsReport });
      return;
    }
    pushParams({ tab: tab === "day" ? "day" : tab });
  }

  function setSalesReport(report: SalesReportId) {
    pushParams({ tab: "sales", report });
  }

  function setOperationsReport(report: OperationsReportId) {
    pushParams({ tab: "operations", report });
  }

  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={CATEGORY_TABS} activeTab={activeCategory} onChange={setCategory} />

      {activeCategory === "sales" && (
        <TabBar tabs={SALES_REPORT_TABS} activeTab={salesReport} onChange={setSalesReport} />
      )}
      {activeCategory === "operations" && (
        <TabBar tabs={OPERATIONS_REPORT_TABS} activeTab={operationsReport} onChange={setOperationsReport} />
      )}

      {activeCategory === "day" && <DayPipelineReport date={date} sales={dayData.sales} />}

      {activeCategory === "sales" && salesReport === "speed-to-lead" && <SpeedToLeadReport />}
      {activeCategory === "sales" && salesReport === "revenue" && <SalesRevenueReport />}
      {activeCategory === "sales" && salesReport === "commission" && <CommissionReport />}

      {activeCategory === "operations" && operationsReport === "labor-hours" && <LaborHoursReport />}
      {activeCategory === "operations" && operationsReport === "budget-actuals" && (
        <BudgetActualsReport />
      )}
      {activeCategory === "operations" && operationsReport === "dispatch-changes" && (
        <DispatchChangeImpactReport />
      )}

      {activeCategory === "ai-quotes" && <AiQuotesAccuracyReport />}
    </div>
  );
}
