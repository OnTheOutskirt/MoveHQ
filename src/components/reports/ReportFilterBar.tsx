"use client";

import { cn } from "@/lib/utils";

/** Global report filters. "branch" is only surfaced for multi-location companies. */
export type ReportFilterKey =
  | "branch"
  | "salesperson"
  | "crewLeader"
  | "truck"
  | "jobType"
  | "leadSource"
  | "rateType"
  | "distance"
  | "status";

export type ReportDateRangeId =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "custom";

type Option = { value: string; label: string };

export const REPORT_DATE_RANGES: { value: ReportDateRangeId; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

/** Mock option sets — swap for live workspace data when reports are wired up. */
export const REPORT_FILTER_DEFS: Record<
  Exclude<ReportFilterKey, "branch">,
  { label: string; options: Option[] }
> = {
  salesperson: {
    label: "Salesperson",
    options: [
      { value: "all", label: "All salespeople" },
      { value: "jordan", label: "Jordan M." },
      { value: "sam", label: "Sam K." },
      { value: "alex", label: "Alex R." },
    ],
  },
  crewLeader: {
    label: "Crew leader",
    options: [
      { value: "all", label: "All crew leaders" },
      { value: "marcus", label: "Marcus T." },
      { value: "diego", label: "Diego R." },
      { value: "will", label: "Will P." },
    ],
  },
  truck: {
    label: "Truck",
    options: [
      { value: "all", label: "All trucks" },
      { value: "t12", label: "Truck 12 — 26 ft" },
      { value: "t08", label: "Truck 08 — 16 ft" },
      { value: "t03", label: "Truck 03 — 26 ft" },
    ],
  },
  jobType: {
    label: "Job type",
    options: [
      { value: "all", label: "All job types" },
      { value: "residential", label: "Residential" },
      { value: "commercial", label: "Commercial" },
      { value: "storage", label: "Storage" },
      { value: "labor_only", label: "Labor only" },
    ],
  },
  leadSource: {
    label: "Lead source",
    options: [
      { value: "all", label: "All sources" },
      { value: "website", label: "Website" },
      { value: "google", label: "Google" },
      { value: "phone", label: "Phone" },
      { value: "referral", label: "Referral" },
      { value: "repeat", label: "Repeat customer" },
    ],
  },
  rateType: {
    label: "Rate type",
    options: [
      { value: "all", label: "All rates" },
      { value: "hourly", label: "Hourly" },
      { value: "flat", label: "Flat rate" },
    ],
  },
  distance: {
    label: "Distance",
    options: [
      { value: "all", label: "All distances" },
      { value: "local", label: "Local" },
      { value: "long_distance", label: "Long distance" },
    ],
  },
  status: {
    label: "Status",
    options: [
      { value: "all", label: "All statuses" },
      { value: "lead", label: "Lead" },
      { value: "quoted", label: "Quoted" },
      { value: "booked", label: "Booked" },
      { value: "completed", label: "Completed" },
      { value: "lost", label: "Lost" },
    ],
  },
};

const SELECT_CLASS =
  "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_CLASS}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type ReportFilterBarProps = {
  dateRange: ReportDateRangeId;
  onDateRangeChange: (value: ReportDateRangeId) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  /** Additional filters to surface for the active report. */
  filters: ReportFilterKey[];
  filterValues: Partial<Record<ReportFilterKey, string>>;
  onFilterChange: (key: ReportFilterKey, value: string) => void;
  /** Branch options (only rendered when more than one location exists). */
  branchOptions: Option[];
  showBranch: boolean;
};

export function ReportFilterBar({
  dateRange,
  onDateRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  filters,
  filterValues,
  onFilterChange,
  branchOptions,
  showBranch,
}: ReportFilterBarProps) {
  const extraKeys = filters.filter((k) => k !== "branch");

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-wrap items-end gap-3">
        <FilterField
          label="Date range"
          value={dateRange}
          onChange={(v) => onDateRangeChange(v as ReportDateRangeId)}
          options={REPORT_DATE_RANGES}
        />

        {dateRange === "custom" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">From</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange(e.target.value)}
                className={SELECT_CLASS}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">To</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomToChange(e.target.value)}
                className={SELECT_CLASS}
              />
            </label>
          </>
        )}

        {showBranch && filters.includes("branch") && (
          <FilterField
            label="Branch"
            value={filterValues.branch ?? "all"}
            onChange={(v) => onFilterChange("branch", v)}
            options={branchOptions}
          />
        )}

        {extraKeys.map((key) => {
          const def = REPORT_FILTER_DEFS[key as Exclude<ReportFilterKey, "branch">];
          if (!def) return null;
          return (
            <FilterField
              key={key}
              label={def.label}
              value={filterValues[key] ?? def.options[0]?.value ?? "all"}
              onChange={(v) => onFilterChange(key, v)}
              options={def.options}
            />
          );
        })}

        <button
          type="button"
          onClick={() => {
            onDateRangeChange("this_month");
            extraKeys.forEach((key) => onFilterChange(key, "all"));
            if (showBranch) onFilterChange("branch", "all");
          }}
          className={cn(
            "ml-auto self-end rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500",
            "hover:bg-white hover:text-slate-700",
          )}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
