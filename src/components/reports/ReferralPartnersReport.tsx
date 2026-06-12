"use client";

import { ReferralTouchLogSection } from "@/components/people/ReferralTouchLogSection";
import { useMoves } from "@/components/moves/MovesProvider";
import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { useReferralPartners } from "@/components/providers/ReferralPartnersProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate } from "@/lib/moves/format";
import { salesDirectoryOrgPath, salesDirectoryPersonPath } from "@/lib/navigation/routes";
import { partnerDisplayName } from "@/lib/referrals/referral-metrics";
import {
  applyReferralReportFilters,
  defaultGroupByForCategory,
  defaultReferralReportFilters,
  groupByLabel,
  REFERRAL_REPORT_PERIODS,
  referralDateRange,
  referralReportTotals,
  type ReferralReportFilters,
  type ReferralReportGroupBy,
} from "@/lib/referrals/report-filters";
import {
  type ReferralPartnerStats,
} from "@/lib/referrals/types";
import { catalogReferralTypeLabel } from "@/lib/settings/field-catalog-runtime";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import { cn } from "@/lib/utils";
import { Handshake, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReferralPartnersReport() {
  const { moves } = useMoves();
  const { settings } = useSettings();
  const referralTypes = settings.fieldCatalog.referralTypes;
  const { isReady, resetTouches } = useReferralPartners();
  const [filters, setFilters] = useState<ReferralReportFilters>(defaultReferralReportFilters);
  const [selected, setSelected] = useState<ReferralPartnerStats | null>(null);

  const stats = useMemo(
    () => applyReferralReportFilters(moves, filters),
    [moves, filters],
  );

  const totals = useMemo(() => referralReportTotals(stats), [stats]);
  const range = useMemo(() => referralDateRange(filters), [filters]);

  const selectedTypeMeta = useMemo(
    () =>
      filters.category === "all"
        ? null
        : referralTypes.find((entry) => entry.id === filters.category),
    [filters.category, referralTypes],
  );

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading referral partners…</p>;
  }

  return (
    <>
      <div className="space-y-4">
        <ReferralReportFiltersBar
          filters={filters}
          onChange={setFilters}
          range={range}
          referralTypes={referralTypes}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Referrals" value={String(totals.referrals)} />
            <SummaryCard label="Booked" value={String(totals.booked)} />
            <SummaryCard label="Completed" value={String(totals.completed)} />
            <SummaryCard label="Revenue" value={formatMoney(totals.revenue)} accent />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={resetTouches}>
            Reset touch log
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Handshake className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold text-slate-900">Referral partners</h2>
              {filters.category !== "all" ? (
                <Badge variant="brand">
                  {selectedTypeMeta?.label ??
                    catalogReferralTypeLabel(filters.category)}
                </Badge>
              ) : null}
              <Badge variant="default">
                {groupByLabel(filters.groupBy)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {selectedTypeMeta?.description ?? "All referral sources"} ·{" "}
              {formatMoveDate(range.start)} – {formatMoveDate(range.end)}. Open a row to log
              thank-yous, gifts, and relationship notes.
            </p>
          </div>

          {stats.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              No referral activity in this period — try a wider date range or different filters.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.map((row, index) => (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={() => setSelected(row)}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate font-medium text-slate-900">
                          {partnerDisplayName(row)}
                        </p>
                        {filters.category === "all" ? (
                          <Badge variant="default" className="text-[10px]">
                            {referralTypeLabel(row.referralTypeId, referralTypes)}
                          </Badge>
                        ) : null}
                      </div>
                      {row.subtitle ? (
                        <p className="truncate text-xs text-slate-500">{row.subtitle}</p>
                      ) : null}
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatMoney(row.revenueTotal)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {row.referralCount} referral{row.referralCount === 1 ? "" : "s"} ·{" "}
                        {row.completedCount} done
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ReferralPartnerSidebar partner={selected} onClose={() => setSelected(null)} />

      <ReportMockFooter note="Stats filter by move date in range. Touch log is stored locally for relationship tracking." />
    </>
  );
}

const compactInputClass =
  "rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800";

function referralTypeLabel(id: string, entries: FieldCatalogEntry[]): string {
  return entries.find((entry) => entry.id === id)?.label ?? catalogReferralTypeLabel(id);
}

function ReferralReportFiltersBar({
  filters,
  onChange,
  range,
  referralTypes,
}: {
  filters: ReferralReportFilters;
  onChange: (filters: ReferralReportFilters) => void;
  range: { start: string; end: string };
  referralTypes: FieldCatalogEntry[];
}) {
  const groupOptions: ReferralReportGroupBy[] = ["person", "organization"];

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Period
        </span>
        {REFERRAL_REPORT_PERIODS.map((p) => (
          <FilterPill
            key={p.id}
            active={filters.period === p.id}
            onClick={() => onChange({ ...filters, period: p.id })}
          >
            {p.label}
          </FilterPill>
        ))}
        {filters.period === "custom" ? (
          <span className="inline-flex items-center gap-1.5">
            <input
              type="date"
              value={filters.customStart}
              onChange={(e) => onChange({ ...filters, customStart: e.target.value })}
              className={compactInputClass}
            />
            <span className="text-xs text-slate-400">–</span>
            <input
              type="date"
              value={filters.customEnd}
              onChange={(e) => onChange({ ...filters, customEnd: e.target.value })}
              className={compactInputClass}
            />
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">
            {formatMoveDate(range.start)} – {formatMoveDate(range.end)}
          </span>
        )}

        <span className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:inline-block" />

        <label className="inline-flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Type
          </span>
          <select
            value={filters.category}
            onChange={(e) => {
              const category = e.target.value;
              onChange({
                ...filters,
                category,
                groupBy: defaultGroupByForCategory(category),
              });
            }}
            className={cn(compactInputClass, "max-w-[11rem]")}
          >
            <option value="all">All types</option>
            {referralTypes.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Group
          </span>
          <select
            value={filters.groupBy}
            onChange={(e) =>
              onChange({ ...filters, groupBy: e.target.value as ReferralReportGroupBy })
            }
            className={cn(compactInputClass, "max-w-[11rem]")}
          >
            {groupOptions.map((opt) => (
              <option key={opt} value={opt}>
                {groupByLabel(opt)}
              </option>
            ))}
          </select>
        </label>

        <label className="relative ml-auto min-w-[10rem] flex-1 sm:max-w-[14rem]">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search…"
            className="w-full rounded-md border border-slate-200 py-1 pl-7 pr-2 text-xs"
          />
        </label>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        accent ? "border-brand-200 bg-brand-50/50" : "border-slate-200 bg-white",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          accent ? "text-brand-800" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ReferralPartnerSidebar({
  partner,
  onClose,
}: {
  partner: ReferralPartnerStats | null;
  onClose: () => void;
}) {
  const directoryHref =
    partner?.partnerType === "person"
      ? salesDirectoryPersonPath(partner.partnerId)
      : partner?.partnerType === "organization"
        ? salesDirectoryOrgPath(partner.partnerId)
        : null;

  return (
    <DetailSidebar
      open={Boolean(partner)}
      onClose={onClose}
      title={partner ? partnerDisplayName(partner) : "Partner"}
      description={partner?.subtitle}
      widthClassName="max-w-lg"
    >
      {partner ? (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm">
            <Stat label="Referrals" value={String(partner.referralCount)} />
            <Stat label="Booked" value={String(partner.bookedCount)} />
            <Stat label="Completed" value={String(partner.completedCount)} />
            <Stat label="Revenue" value={formatMoney(partner.revenueTotal)} />
            {partner.lastReferralDate ? (
              <div className="col-span-2">
                <Stat label="Last referral" value={formatMoveDate(partner.lastReferralDate)} />
              </div>
            ) : null}
          </dl>

          {directoryHref && !partner.partnerId.startsWith("linked:") ? (
            <Link
              href={directoryHref}
              className="inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open in directory →
            </Link>
          ) : null}

          <ReferralTouchLogSection
            partnerType={partner.partnerType}
            partnerId={partner.partnerId}
          />
        </div>
      ) : null}
    </DetailSidebar>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
