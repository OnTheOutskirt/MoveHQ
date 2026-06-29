"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import type { Capability } from "@/lib/auth/capabilities";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { DayPipelineReport } from "@/components/reports/DayPipelineReport";
import { PlaceholderReport } from "@/components/reports/PlaceholderReport";
import {
  ReportFilterBar,
  type ReportDateRangeId,
  type ReportFilterKey,
} from "@/components/reports/ReportFilterBar";
import { ReportWidgetGrid } from "@/components/reports/ReportWidgets";
import { REPORT_WIDGETS } from "@/lib/reports/report-widgets";
import { TabBar } from "@/components/shared/TabBar";
import { ModulePage } from "@/components/shared/ModulePage";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey } from "@/lib/calendar/date-utils";
import { pageMeta } from "@/lib/navigation/page-meta";
import { ROUTES } from "@/lib/navigation/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const ALL_REPORT_CAPS: Capability[] = [
  "reports.day",
  "reports.sales",
  "reports.operations",
  "reports.ai_quotes",
];

type SubReport = {
  id: string;
  label: string;
  /** Additional filters (beyond date range) to surface for this report. */
  filters: ReportFilterKey[];
};

type ReportSection = {
  id: string;
  label: string;
  /** Section is visible if the user has any of these capabilities. */
  caps: Capability[];
  subtabs: SubReport[];
};

const SECTIONS: ReportSection[] = [
  {
    id: "overview",
    label: "Overview",
    caps: ALL_REPORT_CAPS,
    subtabs: [
      { id: "dashboard", label: "Dashboard", filters: ["branch"] },
      { id: "kpis", label: "KPIs", filters: ["branch"] },
      { id: "trends", label: "Trends", filters: ["branch"] },
      { id: "day-report", label: "Day report", filters: ["branch"] },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    caps: ["reports.sales"],
    subtabs: [
      { id: "pipeline", label: "Pipeline", filters: ["branch", "salesperson", "leadSource", "status"] },
      { id: "quotes", label: "Quotes", filters: ["branch", "salesperson", "jobType", "rateType", "status"] },
      { id: "bookings", label: "Bookings", filters: ["branch", "salesperson", "jobType", "rateType", "distance"] },
      { id: "performance", label: "Performance", filters: ["branch", "salesperson"] },
      { id: "customers", label: "Customers", filters: ["branch", "leadSource"] },
      {
        id: "ai-estimating",
        label: "AI & Estimating",
        filters: ["branch", "jobType", "rateType", "leadSource", "distance"],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    caps: ["reports.sales"],
    subtabs: [
      { id: "lead-sources", label: "Lead Sources", filters: ["branch", "leadSource", "jobType"] },
      { id: "campaigns", label: "Campaigns", filters: ["branch", "leadSource"] },
      { id: "roi", label: "ROI", filters: ["branch", "leadSource"] },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    caps: ["reports.operations"],
    subtabs: [
      { id: "jobs", label: "Jobs", filters: ["branch", "jobType", "crewLeader", "truck", "distance", "status"] },
      { id: "crews", label: "Crews", filters: ["branch", "crewLeader", "jobType"] },
      { id: "fleet", label: "Fleet", filters: ["branch", "truck"] },
      { id: "schedule", label: "Schedule", filters: ["branch", "crewLeader", "truck", "jobType", "status"] },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    caps: ["reports.sales"],
    subtabs: [
      { id: "revenue", label: "Revenue", filters: ["branch", "jobType", "rateType", "distance"] },
      { id: "expenses", label: "Expenses", filters: ["branch"] },
      { id: "payments", label: "Payments", filters: ["branch", "status"] },
      { id: "profit-loss", label: "Profit & Loss", filters: ["branch"] },
    ],
  },
  {
    id: "profitability",
    label: "Profitability",
    caps: ["reports.operations"],
    subtabs: [
      { id: "jobs", label: "Jobs", filters: ["branch", "jobType", "rateType", "distance", "crewLeader"] },
      { id: "crews", label: "Crews", filters: ["branch", "crewLeader"] },
      { id: "services", label: "Services", filters: ["branch", "jobType"] },
      { id: "lead-sources", label: "Lead Sources", filters: ["branch", "leadSource"] },
    ],
  },
];

/** Map deprecated ?tab=/?report= deep links onto the new section/subtab ids. */
const LEGACY_TAB_MAP: Record<string, { section: string; sub: string }> = {
  day: { section: "overview", sub: "day-report" },
  budget: { section: "profitability", sub: "jobs" },
  "ai-quotes": { section: "sales", sub: "ai-estimating" },
  "ai-estimating": { section: "sales", sub: "ai-estimating" },
  customers: { section: "sales", sub: "customers" },
};

const PLACEHOLDER_COPY: Record<string, string> = {
  "overview:dashboard": "At-a-glance snapshot of the whole business for the selected period.",
  "overview:kpis": "Headline KPIs with period-over-period comparisons.",
  "overview:trends": "Trend lines for revenue, bookings, and lead volume over time.",
};

function findSection(id: string | null): ReportSection | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function ReportsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useCapabilities();
  const { isAllLocationsView, activeLocation, hasMultipleLocations, allowedLocations } =
    useWorkspace();
  const meta = pageMeta["/operations/reports"];

  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => s.caps.some((c) => can(c))),
    [can],
  );

  const rawTab = searchParams.get("tab");
  const rawSub = searchParams.get("sub");
  const rawReport = searchParams.get("report");

  useEffect(() => {
    if (rawReport === "referral-partners") {
      router.replace(ROUTES.salesReferralPartners);
    }
  }, [rawReport, router]);

  // Resolve active section + subtab, honoring legacy deep links and defaults.
  const legacy = rawTab && LEGACY_TAB_MAP[rawTab] ? LEGACY_TAB_MAP[rawTab] : null;
  const requestedSectionId = legacy?.section ?? rawTab;

  const activeSection =
    findSection(requestedSectionId) && visibleSections.some((s) => s.id === requestedSectionId)
      ? findSection(requestedSectionId)!
      : visibleSections[0] ?? SECTIONS[0];

  const requestedSubId = rawSub ?? legacy?.sub ?? null;
  const activeSub =
    activeSection.subtabs.find((t) => t.id === requestedSubId) ?? activeSection.subtabs[0];

  // Global filter state (shared across reports while on the page).
  const [dateRange, setDateRange] = useState<ReportDateRangeId>("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filterValues, setFilterValues] = useState<Partial<Record<ReportFilterKey, string>>>({});

  const date = useMemo(() => {
    const raw = searchParams.get("date");
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return parseDateKey(raw);
    }
    return new Date();
  }, [searchParams]);

  const today = useMemo(() => new Date(), []);
  const dayData = useMemo(() => buildMockDay(date, today), [date, today]);

  const branchOptions = useMemo(
    () => [
      { value: "all", label: "All locations" },
      ...allowedLocations.map((l) => ({ value: l.id, label: l.name })),
    ],
    [allowedLocations],
  );

  function pushSelection(sectionId: string, subId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", sectionId);
    params.set("sub", subId);
    params.delete("report");
    if (!(sectionId === "overview" && subId === "day-report")) {
      params.delete("date");
    }
    router.push(`/operations/reports?${params.toString()}`, { scroll: false });
  }

  function setSection(sectionId: string) {
    const section = findSection(sectionId);
    if (!section) return;
    pushSelection(sectionId, section.subtabs[0]?.id ?? "");
  }

  function setSub(subId: string) {
    pushSelection(activeSection.id, subId);
  }

  function setFilter(key: ReportFilterKey, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }

  const reportScopeLabel = isAllLocationsView
    ? "All locations — combined totals with per-branch breakdown where available."
    : `${activeLocation?.name ?? "Location"} — metrics for this branch only.`;

  if (visibleSections.length === 0) {
    return (
      <AccessDenied
        title="No report categories available"
        description="Your role doesn't include any report tabs. Managers and admins typically see sales, operations, and AI reports."
      />
    );
  }

  function renderReport(): ReactNode {
    const key = `${activeSection.id}:${activeSub.id}`;

    if (key === "overview:day-report") {
      return <DayPipelineReport date={date} sales={dayData.sales} />;
    }

    const widgets = REPORT_WIDGETS[key];
    if (widgets) {
      return <ReportWidgetGrid widgets={widgets} />;
    }

    return (
      <PlaceholderReport
        title={`${activeSection.label} · ${activeSub.label}`}
        description={
          PLACEHOLDER_COPY[key] ?? `${activeSection.label} ${activeSub.label.toLowerCase()} report.`
        }
      />
    );
  }

  const sectionTabs = visibleSections.map((s) => ({ id: s.id, label: s.label }));
  const subTabs = activeSection.subtabs.map((t) => ({ id: t.id, label: t.label }));

  return (
    <div className="space-y-5">
      <ModulePage title={meta.title} description={reportScopeLabel} />

      <TabBar tabs={sectionTabs} activeTab={activeSection.id} onChange={setSection} />
      <TabBar tabs={subTabs} activeTab={activeSub.id} onChange={setSub} />

      <ReportFilterBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        filters={activeSub.filters}
        filterValues={filterValues}
        onFilterChange={setFilter}
        branchOptions={branchOptions}
        showBranch={hasMultipleLocations}
      />

      {renderReport()}
    </div>
  );
}
