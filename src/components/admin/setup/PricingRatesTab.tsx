"use client";

import { RateHistoryPanel } from "@/components/admin/setup/RateHistoryPanel";
import { SettingsField } from "@/components/settings/SettingsField";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import { DEFAULT_HOURLY_QUOTE_SETTINGS, type HourlyQuoteSettings } from "@/lib/moves/hourly-quote-settings";
import type { PricingRateSchedule } from "@/lib/pricing/rate-history-types";
import { cn } from "@/lib/utils";

type PricingRatesTabProps = {
  hourlyCrewRate: number;
  hourlySettings: HourlyQuoteSettings;
  onHourlyCrewRateChange: (value: number) => void;
  onHourlySettingsChange: (patch: Partial<HourlyQuoteSettings>) => void;
  schedule: PricingRateSchedule;
  catalog: EquipmentCatalogItem[];
};

function moneyInput(value: number, onChange: (n: number) => void, className?: string) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className={cn(
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900",
        className,
      )}
    />
  );
}

export function PricingRatesTab({
  hourlyCrewRate,
  hourlySettings,
  onHourlyCrewRateChange,
  onHourlySettingsChange,
  schedule,
  catalog,
}: PricingRatesTabProps) {
  const supplyItems = catalog.filter((item) => item.category === "supply");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Hourly quote package</h3>
        <p className="mt-1 text-xs text-slate-500">
          Default crew rate and fees for new hourly quotes. Saving setup records a new history entry
          when values change.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SettingsField label="Default crew rate ($/hr)">
            {moneyInput(hourlyCrewRate, onHourlyCrewRateChange)}
          </SettingsField>
          <SettingsField label="Travel fee (flat)">
            {moneyInput(hourlySettings.travelFee, (v) => onHourlySettingsChange({ travelFee: v }))}
          </SettingsField>
          <SettingsField label="Minimum hours (local)">
            <input
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={hourlySettings.minimumHours}
              onChange={(e) =>
                onHourlySettingsChange({
                  minimumHours: Math.max(1, Number(e.target.value) || DEFAULT_HOURLY_QUOTE_SETTINGS.minimumHours),
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </SettingsField>
          <SettingsField label="Dump fee">
            {moneyInput(hourlySettings.dumpFee, (v) => onHourlySettingsChange({ dumpFee: v }))}
          </SettingsField>
          <SettingsField label="Crating from">
            {moneyInput(hourlySettings.cratingFrom, (v) => onHourlySettingsChange({ cratingFrom: v }))}
          </SettingsField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">Supply unit prices (current)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Edit prices on the <span className="font-medium text-slate-700">Equipment &amp; supplies</span>{" "}
          tab. Both tabs share the same rate history on save.
        </p>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {supplyItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <span className="text-slate-700">{item.label}</span>
              <span className="font-medium tabular-nums text-slate-900">
                ${item.unitPrice.toFixed(0)}
                <span className="text-xs font-normal text-slate-400"> / {item.unit}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <RateHistoryPanel entries={schedule.entries} />
    </div>
  );
}
