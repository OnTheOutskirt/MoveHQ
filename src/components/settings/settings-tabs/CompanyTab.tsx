"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export function CompanyTab() {
  const { config, updateConfig } = useWorkspace();
  const { company } = config;

  function patchCompany(patch: Partial<typeof company>) {
    updateConfig({ ...config, company: { ...company, ...patch } });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company (organization)</CardTitle>
          <p className="text-sm text-slate-500">
            Legal and brand identity for the whole business. Branch addresses, phones, hours, and
            calendars are configured per location.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Legal name" className="sm:col-span-2">
            <SettingsInput
              value={company.legalName}
              onChange={(e) => patchCompany({ legalName: e.target.value })}
              placeholder="Jonah's Movers LLC"
            />
          </SettingsField>
          <SettingsField label="Company display name" hint="Often matches Branding tab.">
            <SettingsInput
              value={company.name}
              onChange={(e) => patchCompany({ name: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Corporate website" hint="Optional — branches can have their own.">
            <SettingsInput
              value={company.website}
              onChange={(e) => patchCompany({ website: e.target.value })}
              placeholder="https://jonahsmovers.com"
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card className="border-brand-100 bg-brand-50/30">
        <CardContent className="py-4">
          <p className="text-sm text-brand-900">
            <span className="font-semibold">
              Phone, address, Google review link, office hours, crew days, and timezone
            </span>{" "}
            live on the{" "}
            <Link href="/admin/company?tab=locations" className="font-semibold underline">
              Locations
            </Link>{" "}
            tab for each branch. With a single location, that tab is your full business profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
