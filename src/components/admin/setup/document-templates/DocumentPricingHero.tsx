"use client";

import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import { DocumentHourlyBreakdown } from "@/components/admin/setup/document-templates/DocumentHourlyBreakdown";
import { pricingKindFromVars } from "@/lib/settings/document-accent";
import {
  parseFlatLinesFromVars,
  parseHourlyLinesFromVars,
  type HourlyPricingLine,
} from "@/lib/settings/document-valuation";
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Shield,
  Sparkles,
  Truck,
  User,
  Users,
} from "lucide-react";

type DocumentPricingHeroProps = {
  vars: Record<string, string>;
  kind: DocumentSendKind;
  accentColor: string;
  companyName: string;
  showMoveDetails?: boolean;
  hourlyLines?: HourlyPricingLine[];
  flatLines?: HourlyPricingLine[];
  showMaterialRates?: boolean;
  showFlatBreakdown?: boolean;
};

const FLAT_BENEFITS = [
  { icon: Sparkles, text: "One all-inclusive flat rate — no surprise charges" },
  { icon: Users, text: "Jonah's professional moving crew, trained and background-checked" },
  { icon: Truck, text: "Truck, equipment, blankets & floor protection included" },
  { icon: Shield, text: "Fixed price you can count on from start to finish" },
];

export function DocumentPricingHero({
  vars,
  kind,
  accentColor,
  companyName,
  showMoveDetails = true,
  hourlyLines = [],
  flatLines = [],
  showMaterialRates = false,
  showFlatBreakdown = true,
}: DocumentPricingHeroProps) {
  const pricingKind = pricingKindFromVars(vars);
  const isFlat = pricingKind === "flat";
  const isHourly = pricingKind === "hourly";

  if (isFlat) {
    return (
      <FlatRateHero
        vars={vars}
        kind={kind}
        accentColor={accentColor}
        companyName={companyName}
        showMoveDetails={showMoveDetails}
        flatLines={flatLines.length > 0 ? flatLines : parseFlatLinesFromVars(vars)}
        showFlatBreakdown={showFlatBreakdown}
      />
    );
  }

  if (isHourly) {
    return (
      <HourlyHero
        vars={vars}
        kind={kind}
        accentColor={accentColor}
        showMoveDetails={showMoveDetails}
        hourlyLines={
          hourlyLines.length > 0 ? hourlyLines : parseHourlyLinesFromVars(vars)
        }
        showMaterialRates={showMaterialRates}
      />
    );
  }

  return (
    <GenericPricingHero vars={vars} accentColor={accentColor} showMoveDetails={showMoveDetails} />
  );
}

function FlatRateHero({
  vars,
  kind,
  accentColor,
  companyName,
  showMoveDetails,
  flatLines,
  showFlatBreakdown,
}: Omit<DocumentPricingHeroProps, "vars"> & {
  vars: Record<string, string>;
  flatLines: HourlyPricingLine[];
  showFlatBreakdown: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <div
        className="relative px-5 py-6 text-white"
        style={{
          background: `linear-gradient(145deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 70%, #0f172a) 100%)`,
        }}
      >
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
          style={{ backgroundColor: "white" }}
        />
        <div
          className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full opacity-10"
          style={{ backgroundColor: "white" }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-white/25">
            <Sparkles className="h-3 w-3" />
            All-inclusive flat rate
          </span>

          <p className="mt-4 text-sm font-medium text-white/85">
            {kind === "quote" ? "Your guaranteed move price" : "Your locked-in move price"}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-[2.75rem]">
            {vars.quote_amount}
          </p>
          {vars.has_discount === "yes" && vars.quote_amount_original ? (
            <p className="mt-1 text-sm text-white/70">
              <span className="line-through">{vars.quote_amount_original}</span>
              {vars.discount_reason ? (
                <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/20">
                  {vars.discount_summary || vars.discount_reason}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-white/80">
            {kind === "quote"
              ? `Everything below is included — one price, zero guesswork.`
              : `This flat rate is confirmed in your agreement with ${companyName}.`}
          </p>
          {vars.inventory_volume_display ? (
            <p className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/25">
              Priced on {vars.inventory_basis_label ?? "inventory"} · {vars.inventory_volume_display}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 bg-white px-5 py-5">
        {kind === "quote" ? (
          <p className="text-xs text-slate-500">
            Valuation coverage above is included in this all-in price — released value at no
            charge, or full value protection when selected.
          </p>
        ) : null}

        <ul className="space-y-2.5">
          {FLAT_BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)`,
                  color: accentColor,
                }}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {showMoveDetails ? <MoveDetailsGrid vars={vars} accentColor={accentColor} /> : null}

        {showFlatBreakdown && flatLines.length > 0 ? (
          <DocumentHourlyBreakdown
            lines={flatLines}
            showMaterialRates={false}
            accentColor={accentColor}
            title="What's included in your flat rate"
            footerNote="Each line is rolled into your all-in price — valuation, wardrobe, and standard scope are covered unless noted."
          />
        ) : null}

        {kind === "quote" ? (
          <p
            className="rounded-lg px-3 py-2 text-xs leading-relaxed"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 8%, white)`,
              color: `color-mix(in srgb, ${accentColor} 75%, #0f172a)`,
            }}
          >
            Valid until <strong>{vars.quote_expiry}</strong> · Tap below when you&apos;re ready —
            we&apos;ll follow up with a contract if your date is available
          </p>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            Balance due on completion: <strong>{vars.balance_due}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

function HourlyHero({
  vars,
  kind,
  accentColor,
  showMoveDetails,
  hourlyLines,
  showMaterialRates,
}: {
  vars: Record<string, string>;
  kind: DocumentSendKind;
  accentColor: string;
  showMoveDetails?: boolean;
  hourlyLines: HourlyPricingLine[];
  showMaterialRates: boolean;
}) {
  const hasBallpark = vars.has_ballpark === "yes" && Boolean(vars.hourly_ballpark_total);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200/80">
          <Clock className="h-3 w-3" />
          Hourly pricing
        </span>

        {hasBallpark ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3.5">
            <p className="text-sm font-medium text-amber-950/80">
              {kind === "quote"
                ? "Ballpark estimate for your move"
                : "Typical total at quoted rates"}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-amber-950">
              {vars.hourly_ballpark_total}
            </p>
            {vars.hourly_ballpark_total_original ? (
              <p className="text-sm text-amber-900/70 line-through">
                Was {vars.hourly_ballpark_total_original}
              </p>
            ) : null}
            {vars.has_discount === "yes" && vars.discount_reason ? (
              <p className="mt-1">
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                  {vars.discount_summary || vars.discount_reason}
                </span>
              </p>
            ) : null}
            <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
              {vars.hourly_ballpark_note ||
                "A rough guide only — your final invoice depends on actual time on move day."}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-lg font-semibold text-slate-900">
              {kind === "quote" ? "Your hourly moving quote" : "Hourly service agreement"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Rates and fees are itemized below — labor by the hour, a flat travel fee, materials
              if we pack (charged as used), and any office fees that apply.
            </p>
          </div>
        )}

        {hasBallpark ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Labor rate, travel, and other charges are listed below. Your final invoice is based on
            actual time on move day plus any materials or specialty fees used.
          </p>
        ) : null}
      </div>

      {hourlyLines.length > 0 ? (
        <DocumentHourlyBreakdown
          lines={hourlyLines}
          showMaterialRates={showMaterialRates}
          accentColor={accentColor}
        />
      ) : null}

      {showMoveDetails && hourlyLines.length === 0 ? (
        <div className="px-5 py-4">
          <MoveDetailsGrid vars={vars} accentColor={accentColor} compact />
        </div>
      ) : null}

      {kind === "quote" ? (
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="rounded-lg bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-950/90">
            Valid until <strong>{vars.quote_expiry}</strong> · Request your date below — deposit
            due when you sign the contract
          </p>
        </div>
      ) : null}
    </section>
  );
}

function GenericPricingHero({
  vars,
  accentColor,
  showMoveDetails,
}: {
  vars: Record<string, string>;
  accentColor: string;
  showMoveDetails?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quote total</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{vars.quote_total}</p>
      <p className="text-xs text-slate-500">{vars.pricing_type}</p>
      {showMoveDetails ? (
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <MoveDetailsGrid vars={vars} accentColor={accentColor} compact />
        </div>
      ) : null}
    </section>
  );
}

function MoveDetailsGrid({
  vars,
  accentColor,
  compact,
}: {
  vars: Record<string, string>;
  accentColor: string;
  compact?: boolean;
}) {
  const shipper = vars.shipper_name || vars.customer_name;

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
      <DetailChip
        icon={Calendar}
        label="Move date"
        value={vars.move_date}
        sub={vars.arrival_window}
        accentColor={accentColor}
      />
      {shipper ? (
        <DetailChip
          icon={User}
          label="Shipper"
          value={shipper}
          accentColor={accentColor}
        />
      ) : null}
      <DetailChip
        icon={MapPin}
        label="Route"
        value={vars.origin}
        sub={`→ ${vars.destination}`}
        accentColor={accentColor}
        span
      />
    </div>
  );
}

function DetailChip({
  icon: Icon,
  label,
  value,
  sub,
  accentColor,
  span,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
  accentColor: string;
  span?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 ${span ? "sm:col-span-2" : ""}`}
    >
      <p
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: accentColor }}
      >
        <Icon className="h-3 w-3 opacity-80" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-snug text-slate-900">{value}</p>
      {sub ? <p className="mt-0.5 text-xs leading-snug text-slate-500">{sub}</p> : null}
    </div>
  );
}

export function documentPortalCtaLabel(kind: DocumentSendKind, vars: Record<string, string>): string {
  const pricingKind = pricingKindFromVars(vars);
  if (kind === "quote") {
    return "I'd like to book this move";
  }
  return "Sign & pay deposit";
}
