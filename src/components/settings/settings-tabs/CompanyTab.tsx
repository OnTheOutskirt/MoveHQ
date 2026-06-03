"use client";

import { useSettingsEditor } from "@/lib/settings/use-settings-editor";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const TIMEZONES = [
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Los_Angeles",
  "America/Phoenix",
];

export function CompanyTab() {
  const { settings, updateCompany } = useSettingsEditor();
  const { company } = settings;

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Company contact</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Phone" className="sm:col-span-2">
          <SettingsInput
            type="tel"
            value={company.phone}
            onChange={(e) => updateCompany({ phone: e.target.value })}
            placeholder="(555) 555-0100"
          />
        </SettingsField>
        <SettingsField label="Email" className="sm:col-span-2">
          <SettingsInput
            type="email"
            value={company.email}
            onChange={(e) => updateCompany({ email: e.target.value })}
            placeholder="office@jonahsmovers.com"
          />
        </SettingsField>
        <SettingsField label="Website" className="sm:col-span-2">
          <SettingsInput
            value={company.website}
            onChange={(e) => updateCompany({ website: e.target.value })}
            placeholder="https://jonahsmovers.com"
          />
        </SettingsField>
        <SettingsField label="Street address" className="sm:col-span-2">
          <SettingsInput
            value={company.address}
            onChange={(e) => updateCompany({ address: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="City">
          <SettingsInput value={company.city} onChange={(e) => updateCompany({ city: e.target.value })} />
        </SettingsField>
        <SettingsField label="State">
          <SettingsInput value={company.state} onChange={(e) => updateCompany({ state: e.target.value })} />
        </SettingsField>
        <SettingsField label="ZIP">
          <SettingsInput value={company.zip} onChange={(e) => updateCompany({ zip: e.target.value })} />
        </SettingsField>
        <SettingsField label="Timezone">
          <SettingsSelect
            value={company.timezone}
            onChange={(e) => updateCompany({ timezone: e.target.value })}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Business hours</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Office opens" hint="Used for scheduling and customer-facing hours.">
          <SettingsInput
            type="time"
            value={company.businessHoursStart}
            onChange={(e) => updateCompany({ businessHoursStart: e.target.value })}
          />
        </SettingsField>
        <SettingsField label="Office closes">
          <SettingsInput
            type="time"
            value={company.businessHoursEnd}
            onChange={(e) => updateCompany({ businessHoursEnd: e.target.value })}
          />
        </SettingsField>
      </CardContent>
    </Card>
    </div>
  );
}
