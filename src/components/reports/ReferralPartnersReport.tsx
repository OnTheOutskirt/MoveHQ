"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { ReportMockFooter } from "@/components/reports/ReportMockFooter";
import { useReferralPartners } from "@/components/providers/ReferralPartnersProvider";
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
  REFERRAL_CATEGORY_LABELS,
  REFERRAL_CATEGORY_OPTIONS,
  REFERRAL_REPORT_PERIODS,
  referralDateRange,
  referralReportTotals,
  type ReferralReportFilters,
  type ReferralReportGroupBy,
} from "@/lib/referrals/report-filters";
import {
  REFERRAL_TOUCH_TYPE_LABELS,
  REFERRAL_TOUCH_TYPES,
  type ReferralPartnerStats,
  type ReferralTouchType,
} from "@/lib/referrals/types";
import { cn } from "@/lib/utils";
import { Gift, Handshake, Plus, Search, TrendingUp } from "lucide-react";
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
  const { isReady, resetTouches } = useReferralPartners();
  const [filters, setFilters] = useState<ReferralReportFilters>(defaultReferralReportFilters);
  const [selected, setSelected] = useState<ReferralPartnerStats | null>(null);

  const stats = useMemo(
    () => applyReferralReportFilters(moves, filters),
    [moves, filters],
  );

  const totals = useMemo(() => referralReportTotals(stats), [stats]);
  const range = useMemo(() => referralDateRange(filters), [filters]);

  const categoryMeta = REFERRAL_CATEGORY_OPTIONS.find((c) => c.id === filters.category);

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading referral partners…</p>;
  }

  return (
    <>
      <div className="space-y-4">
        <ReferralReportFiltersBar filters={filters} onChange={setFilters} range={range} />

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
                <Badge variant="brand">{categoryMeta?.label}</Badge>
              ) : null}
              <Badge variant="default">
                {groupByLabel(filters.category, filters.groupBy)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {categoryMeta?.description ?? "All referral sources"} ·{" "}
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
                            {REFERRAL_CATEGORY_LABELS[row.category]}
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

function ReferralReportFiltersBar({
  filters,
  onChange,
  range,
}: {
  filters: ReferralReportFilters;
  onChange: (filters: ReferralReportFilters) => void;
  range: { start: string; end: string };
}) {
  const groupOptions: ReferralReportGroupBy[] = ["person", "organization"];

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
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
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-slate-100 pt-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Type
        </span>
        {REFERRAL_CATEGORY_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.id}
            active={filters.category === opt.id}
            title={opt.description}
            onClick={() =>
              onChange({
                ...filters,
                category: opt.id,
                groupBy: defaultGroupByForCategory(opt.id),
              })
            }
          >
            {opt.label}
          </FilterPill>
        ))}

        <span className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:inline-block" />

        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Group
        </span>
        {groupOptions.map((opt) => (
          <FilterPill
            key={opt}
            active={filters.groupBy === opt}
            onClick={() => onChange({ ...filters, groupBy: opt })}
          >
            {groupByLabel(filters.category, opt)}
          </FilterPill>
        ))}

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
  const { touchesForPartner, addTouch } = useReferralPartners();
  const [touchOpen, setTouchOpen] = useState(false);
  const [touchType, setTouchType] = useState<ReferralTouchType>("thank_you_text");
  const [touchDate, setTouchDate] = useState(new Date().toISOString().slice(0, 10));
  const [touchNotes, setTouchNotes] = useState("");
  const [giftValue, setGiftValue] = useState("");
  const [loggedBy, setLoggedBy] = useState("");

  const touches = partner
    ? touchesForPartner(partner.partnerType, partner.partnerId)
    : [];

  const directoryHref =
    partner?.partnerType === "person"
      ? salesDirectoryPersonPath(partner.partnerId)
      : partner?.partnerType === "organization"
        ? salesDirectoryOrgPath(partner.partnerId)
        : null;

  function resetTouchForm() {
    setTouchType("thank_you_text");
    setTouchDate(new Date().toISOString().slice(0, 10));
    setTouchNotes("");
    setGiftValue("");
    setLoggedBy("");
    setTouchOpen(false);
  }

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

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Relationship log</p>
                <p className="text-xs text-slate-500">
                  Thank-you texts, gifts, lunches, and check-in calls.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setTouchOpen((v) => !v)}
              >
                <Plus className="h-3.5 w-3.5" />
                Log touch
              </Button>
            </div>

            {touchOpen ? (
              <div className="mb-3 space-y-3 rounded-lg border border-brand-200 bg-brand-50/30 p-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Type</span>
                  <select
                    value={touchType}
                    onChange={(e) => setTouchType(e.target.value as ReferralTouchType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  >
                    {REFERRAL_TOUCH_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {REFERRAL_TOUCH_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600">Date</span>
                    <input
                      type="date"
                      value={touchDate}
                      onChange={(e) => setTouchDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    />
                  </label>
                  {touchType === "gift" ? (
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Gift value ($)</span>
                      <input
                        type="number"
                        min={0}
                        value={giftValue}
                        onChange={(e) => setGiftValue(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                      />
                    </label>
                  ) : (
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Logged by</span>
                      <input
                        value={loggedBy}
                        onChange={(e) => setLoggedBy(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                        placeholder="Your name"
                      />
                    </label>
                  )}
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Notes</span>
                  <textarea
                    value={touchNotes}
                    onChange={(e) => setTouchNotes(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm leading-relaxed"
                    placeholder="What you sent, who you spoke with, gift details…"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={resetTouchForm}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!touchNotes.trim()}
                    onClick={() => {
                      addTouch({
                        partnerType: partner.partnerType,
                        partnerId: partner.partnerId,
                        touchType,
                        date: touchDate,
                        notes: touchNotes.trim(),
                        giftValue: giftValue ? Number(giftValue) : undefined,
                        loggedBy: loggedBy.trim() || undefined,
                      });
                      resetTouchForm();
                    }}
                  >
                    Save touch
                  </Button>
                </div>
              </div>
            ) : null}

            {touches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
                <Gift className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-sm text-slate-600">No touches logged yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {touches.map((touch) => (
                  <li
                    key={touch.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">{REFERRAL_TOUCH_TYPE_LABELS[touch.touchType]}</Badge>
                      <span className="text-xs text-slate-500">{formatMoveDate(touch.date)}</span>
                      {touch.giftValue != null ? (
                        <span className="text-xs font-medium text-slate-700">
                          {formatMoney(touch.giftValue)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-slate-700">{touch.notes}</p>
                    {touch.loggedBy ? (
                      <p className="mt-1 text-[11px] text-slate-400">{touch.loggedBy}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
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
