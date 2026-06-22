"use client";

import { EquipmentCatalogSection } from "@/components/admin/setup/EquipmentCatalogSection";
import { RateHistoryPanel } from "@/components/admin/setup/RateHistoryPanel";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { EditableNumberInput } from "@/components/settings/EditableNumberInput";
import { SettingsField } from "@/components/settings/SettingsField";
import { TabBar } from "@/components/shared/TabBar";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import {
  crewSizeLabel,
  MOVE_TYPE_PRICING_IDS,
  MOVE_TYPE_PRICING_LABELS,
  TRAVEL_CHARGE_METHOD_LABELS,
  type CrewSizeHourlyRate,
  type FlatRateQuoteSettings,
  type HourlyQuoteSettings,
  type MoveTypePricingId,
  type TravelChargeMethod,
  type TravelFeeConfig,
} from "@/lib/moves/hourly-quote-settings";
import type { PricingRateSchedule } from "@/lib/pricing/rate-history-types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const RATES_CATALOG_SUBTABS = [
  { id: "rates", label: "Rates & catalog" },
  { id: "history", label: "Rate history" },
] as const;

type RatesCatalogSubTab = (typeof RATES_CATALOG_SUBTABS)[number]["id"];

type RatesCatalogTabProps = {
  hourlySettings: HourlyQuoteSettings;
  onHourlySettingsChange: (patch: Partial<HourlyQuoteSettings>) => void;
  flatRateSettings: FlatRateQuoteSettings;
  onFlatRateSettingsChange: (patch: Partial<FlatRateQuoteSettings>) => void;
  catalog: EquipmentCatalogItem[];
  onCatalogChange: (next: EquipmentCatalogItem[]) => void;
  schedule: PricingRateSchedule;
};

const COMPACT_INPUT =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900";

function moneyInput(value: number, onChange: (n: number) => void, className?: string) {
  return (
    <EditableNumberInput
      value={value}
      onCommit={onChange}
      min={0}
      step={1}
      className={cn(COMPACT_INPUT, "tabular-nums", className)}
    />
  );
}

export function RatesCatalogTab({
  hourlySettings,
  onHourlySettingsChange,
  flatRateSettings,
  onFlatRateSettingsChange,
  catalog,
  onCatalogChange,
  schedule,
}: RatesCatalogTabProps) {
  const [subTab, setSubTab] = useState<RatesCatalogSubTab>("rates");
  const supplies = useMemo(
    () => catalog.filter((item) => item.category === "supply"),
    [catalog],
  );
  const equipment = useMemo(
    () => catalog.filter((item) => item.category === "equipment"),
    [catalog],
  );

  function patchCrewRate(crewSize: CrewSizeHourlyRate["crewSize"], patch: Partial<CrewSizeHourlyRate>) {
    onHourlySettingsChange({
      crewRates: hourlySettings.crewRates.map((row) =>
        row.crewSize === crewSize ? { ...row, ...patch } : row,
      ),
    });
  }

  function patchTravel(moveType: MoveTypePricingId, patch: Partial<TravelFeeConfig>) {
    onHourlySettingsChange({
      travelByMoveType: {
        ...hourlySettings.travelByMoveType,
        [moveType]: { ...hourlySettings.travelByMoveType[moveType], ...patch },
      },
    });
  }

  function patchServiceFees(patch: Partial<HourlyQuoteSettings["serviceFees"]>) {
    onHourlySettingsChange({
      serviceFees: { ...hourlySettings.serviceFees, ...patch },
      dumpFee: patch.dumpFee ?? hourlySettings.serviceFees.dumpFee,
      cratingFrom: patch.cratingFrom ?? hourlySettings.serviceFees.cratingFrom,
    });
  }

  return (
    <div className="space-y-4">
      <TabBar tabs={RATES_CATALOG_SUBTABS} activeTab={subTab} onChange={setSubTab} />

      {subTab === "history" ? (
        <RateHistoryPanel entries={schedule.entries} />
      ) : (
    <div className="space-y-2">
      <SetupAccordion
        title="Hourly crew rates"
        description="$/hr and minimum hours by crew size (2–10+). Local vs long-distance minimums."
        count={hourlySettings.crewRates.length}
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Crew</th>
                <th className="px-3 py-2">Rate ($/hr)</th>
                <th className="px-3 py-2">Min hrs · local</th>
                <th className="px-3 py-2">Min hrs · long distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hourlySettings.crewRates.map((row) => (
                <tr key={row.crewSize}>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {crewSizeLabel(row.crewSize)} movers
                  </td>
                  <td className="px-3 py-2">{moneyInput(row.hourlyRate, (v) => patchCrewRate(row.crewSize, { hourlyRate: v }))}</td>
                  <td className="px-3 py-2">
                    <EditableNumberInput
                      value={row.minimumHoursLocal}
                      onCommit={(v) => patchCrewRate(row.crewSize, { minimumHoursLocal: v })}
                      min={0}
                      max={12}
                      step={0.5}
                      fallback={0}
                      className={cn(COMPACT_INPUT, "max-w-[6rem]")}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableNumberInput
                      value={row.minimumHoursLongDistance}
                      onCommit={(v) => patchCrewRate(row.crewSize, { minimumHoursLongDistance: v })}
                      min={0}
                      max={12}
                      step={0.5}
                      fallback={0}
                      className={cn(COMPACT_INPUT, "max-w-[6rem]")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SetupAccordion>

      <SetupAccordion
        title="Travel fees"
        description="How drive time is charged — flat depot legs, round trip, or on the clock. Per move type."
        count={MOVE_TYPE_PRICING_IDS.length}
      >
        <div className="space-y-4">
          {MOVE_TYPE_PRICING_IDS.map((moveType) => {
            const travel = hourlySettings.travelByMoveType[moveType];
            return (
              <div key={moveType} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  {MOVE_TYPE_PRICING_LABELS[moveType]}
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <SettingsField label="Charge method">
                    <select
                      value={travel.method}
                      onChange={(e) =>
                        patchTravel(moveType, { method: e.target.value as TravelChargeMethod })
                      }
                      className={COMPACT_INPUT}
                    >
                      {(
                        Object.entries(TRAVEL_CHARGE_METHOD_LABELS) as [TravelChargeMethod, string][]
                      ).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </SettingsField>
                  {travel.method === "flat_round_trip" || travel.method === "flat_travel_only" ? (
                    <SettingsField label="Flat amount">
                      {moneyInput(travel.flatAmount, (v) => patchTravel(moveType, { flatAmount: v }))}
                    </SettingsField>
                  ) : null}
                  {travel.method === "split_depot_legs" ? (
                    <>
                      <SettingsField label="Depot → origin">
                        {moneyInput(travel.depotToOrigin, (v) =>
                          patchTravel(moveType, { depotToOrigin: v }),
                        )}
                      </SettingsField>
                      <SettingsField label="Destination → depot">
                        {moneyInput(travel.destinationToDepot, (v) =>
                          patchTravel(moveType, { destinationToDepot: v }),
                        )}
                      </SettingsField>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </SetupAccordion>

      <SetupAccordion
        title="Service & add-on fees"
        description="Standard fees quoted on hourly jobs — dump, crating, appliances, stairs, packing labor."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SettingsField label="Dump fee">
            {moneyInput(hourlySettings.serviceFees.dumpFee, (v) => patchServiceFees({ dumpFee: v }))}
          </SettingsField>
          <SettingsField label="Crating from">
            {moneyInput(hourlySettings.serviceFees.cratingFrom, (v) =>
              patchServiceFees({ cratingFrom: v }),
            )}
          </SettingsField>
          <SettingsField label="Crating labor ($/hr)">
            {moneyInput(hourlySettings.serviceFees.cratingHourly ?? 0, (v) =>
              patchServiceFees({ cratingHourly: v }),
            )}
          </SettingsField>
          <SettingsField label="Appliance fee (ea)">
            {moneyInput(hourlySettings.serviceFees.applianceFee, (v) =>
              patchServiceFees({ applianceFee: v }),
            )}
          </SettingsField>
          <SettingsField label="Stair / carry fee">
            {moneyInput(hourlySettings.serviceFees.stairCarryFee, (v) =>
              patchServiceFees({ stairCarryFee: v }),
            )}
          </SettingsField>
          <SettingsField label="Packing labor ($/hr)">
            {moneyInput(hourlySettings.serviceFees.packingLaborPerHour, (v) =>
              patchServiceFees({ packingLaborPerHour: v }),
            )}
          </SettingsField>
        </div>
      </SetupAccordion>

      <SetupAccordion
        title="Flat-rate quoting"
        description="How AI and manual flat quotes estimate from inventory — cubic feet or weight."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SettingsField label="Inventory basis">
            <select
              value={flatRateSettings.inventoryBasis}
              onChange={(e) =>
                onFlatRateSettingsChange({
                  inventoryBasis: e.target.value as FlatRateQuoteSettings["inventoryBasis"],
                })
              }
              className={COMPACT_INPUT}
            >
              <option value="cubic_feet">Cubic feet</option>
              <option value="weight">Weight (lbs)</option>
            </select>
          </SettingsField>
          <SettingsField
            label={
              flatRateSettings.inventoryBasis === "weight" ? "Rate per lb ($)" : "Rate per cu ft ($)"
            }
          >
            <EditableNumberInput
              value={flatRateSettings.ratePerUnit}
              onCommit={(v) => onFlatRateSettingsChange({ ratePerUnit: v })}
              min={0}
              step={0.01}
              className={cn(COMPACT_INPUT, "tabular-nums")}
            />
          </SettingsField>
          <SettingsField label="Minimum charge">
            {moneyInput(flatRateSettings.minimumCharge, (v) =>
              onFlatRateSettingsChange({ minimumCharge: v }),
            )}
          </SettingsField>
        </div>
      </SetupAccordion>

      <EquipmentCatalogSection
        title="Supplies"
        description="Boxes, paper, wardrobe cartons — unit prices on quotes when used."
        category="supply"
        items={supplies}
        allItems={catalog}
        onChange={onCatalogChange}
      />

      <EquipmentCatalogSection
        title="Equipment"
        description="Blankets, dollies, floor protection — usually $0 (internal prep)."
        category="equipment"
        items={equipment}
        allItems={catalog}
        onChange={onCatalogChange}
      />
    </div>
      )}
    </div>
  );
}
