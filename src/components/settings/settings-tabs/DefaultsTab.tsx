"use client";

import { useSettingsEditor } from "@/lib/settings/use-settings-editor";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DepositDefaultMode } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

export function DefaultsTab() {
  const { settings, updateDefaults } = useSettingsEditor();
  const { defaults } = settings;

  function setDepositMode(mode: DepositDefaultMode) {
    if (mode === defaults.depositMode) return;
    updateDefaults({
      depositMode: mode,
      depositValue: mode === "fixed" ? 100 : 25,
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales & quoting</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Default pricing type">
            <SettingsSelect
              value={defaults.defaultPricingType}
              onChange={(e) =>
                updateDefaults({
                  defaultPricingType: e.target.value as "hourly" | "flat_rate",
                })
              }
            >
              <option value="flat_rate">Flat rate</option>
              <option value="hourly">Hourly</option>
            </SettingsSelect>
          </SettingsField>

          <SettingsField
            label="Default deposit"
            hint={
              defaults.depositMode === "fixed"
                ? "Flat dollar amount suggested on new quotes."
                : "Percentage of quote total suggested on new quotes."
            }
            className="sm:col-span-2"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setDepositMode("fixed")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    defaults.depositMode === "fixed"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Dollar amount
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMode("percent")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    defaults.depositMode === "percent"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Percent
                </button>
              </div>
              <div className="relative min-w-0 flex-1 sm:max-w-[12rem]">
                {defaults.depositMode === "fixed" ? (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    $
                  </span>
                ) : null}
                <SettingsInput
                  type="number"
                  min={0}
                  max={defaults.depositMode === "percent" ? 100 : undefined}
                  step={defaults.depositMode === "fixed" ? 1 : 1}
                  className={defaults.depositMode === "fixed" ? "pl-7" : "pr-8"}
                  value={defaults.depositValue}
                  onChange={(e) =>
                    updateDefaults({ depositValue: Number(e.target.value) || 0 })
                  }
                />
                {defaults.depositMode === "percent" ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    %
                  </span>
                ) : null}
              </div>
            </div>
          </SettingsField>

          <SettingsField label="Quote validity (days)" className="sm:col-span-2">
            <SettingsInput
              type="number"
              min={1}
              max={90}
              value={defaults.quoteValidityDays}
              onChange={(e) => updateDefaults({ quoteValidityDays: Number(e.target.value) })}
            />
          </SettingsField>
        </CardContent>
      </Card>
    </div>
  );
}
