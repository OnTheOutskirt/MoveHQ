"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function DefaultsTab() {
  const { settings, updateDefaults } = useSettings();
  const { defaults } = settings;

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
          <SettingsField label="Default deposit %" hint="Suggested deposit on new quotes.">
            <SettingsInput
              type="number"
              min={0}
              max={100}
              value={defaults.depositPercent}
              onChange={(e) => updateDefaults({ depositPercent: Number(e.target.value) })}
            />
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

      <Card>
        <CardHeader>
          <CardTitle>Business hours</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Office opens">
            <SettingsInput
              type="time"
              value={defaults.businessHoursStart}
              onChange={(e) => updateDefaults({ businessHoursStart: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Office closes">
            <SettingsInput
              type="time"
              value={defaults.businessHoursEnd}
              onChange={(e) => updateDefaults({ businessHoursEnd: e.target.value })}
            />
          </SettingsField>
        </CardContent>
      </Card>
    </div>
  );
}
