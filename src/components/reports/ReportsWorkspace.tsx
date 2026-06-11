"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import type { Capability } from "@/lib/auth/capabilities";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { AiQuotesAccuracyReport } from "@/components/reports/AiQuotesAccuracyReport";
import { BudgetActualsReport } from "@/components/reports/BudgetActualsReport";
import { CommissionReport } from "@/components/reports/CommissionReport";
import { DayPipelineReport } from "@/components/reports/DayPipelineReport";
import { DispatchChangeImpactReport } from "@/components/reports/DispatchChangeImpactReport";
import { InventoryReport } from "@/components/reports/InventoryReport";
import { LaborHoursReport } from "@/components/reports/LaborHoursReport";
import { SalesRevenueReport } from "@/components/reports/SalesRevenueReport";
import { SpeedToLeadReport } from "@/components/reports/SpeedToLeadReport";
import { TabBar } from "@/components/shared/TabBar";
import { ModulePage } from "@/components/shared/ModulePage";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { pageMeta } from "@/lib/navigation/page-meta";
import { ROUTES } from "@/lib/navigation/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const CATEGORY_TABS = [
  { id: "day", label: "Day report", cap: "reports.day" as Capability },
  { id: "sales", label: "Sales", cap: "reports.sales" as Capability },
  { id: "operations", label: "Operations", cap: "reports.operations" as Capability },
  { id: "ai-quotes", label: "AI quotes", cap: "reports.ai_quotes" as Capability },
] as const;

const SALES_REPORT_TABS = [
  { id: "speed-to-lead", label: "Speed to lead" },
  { id: "revenue", label: "Revenue booked" },
  { id: "commission", label: "Commission" },
] as const;

const OPERATIONS_REPORT_TABS = [
  { id: "labor-hours", label: "Labor hours" },
  { id: "inventory", label: "Inventory" },
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
  const { can } = useCapabilities();
  const { isAllLocationsView, activeLocation } = useWorkspace();
  const meta = pageMeta["/operations/reports"];

  const categoryTabs = CATEGORY_TABS.filter((t) => can(t.cap)).map(({ id, label }) => ({
    id,
    label,
  }));

  const rawTab = searchParams.get("tab");
  const preferredCategory: CategoryTabId = isCategoryTab(rawTab) ? rawTab : "day";
  const activeCategory: CategoryTabId = categoryTabs.some((t) => t.id === preferredCategory)
    ? preferredCategory
    : (categoryTabs[0]?.id as CategoryTabId) ?? "day";

  const rawReport = searchParams.get("report");

  useEffect(() => {
    if (rawReport === "referral-partners") {
      router.replace(ROUTES.salesReferralPartners);
    }
  }, [rawReport, router]);

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

  const reportScopeLabel = isAllLocationsView
    ? "All locations — combined totals with per-branch breakdown where available."
    : `${activeLocation?.name ?? "Location"} — metrics for this branch only.`;

  if (categoryTabs.length === 0) {
    return (
      <AccessDenied
        title="No report categories available"
        description="Your role doesn't include any report tabs. Managers and admins typically see day, sales, and operations reports."
      />
    );
  }

  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={`${meta.description} ${reportScopeLabel}`} />

      <TabBar tabs={categoryTabs} activeTab={activeCategory} onChange={setCategory} />

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
      {activeCategory === "operations" && operationsReport === "inventory" && <InventoryReport />}
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
