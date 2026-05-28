"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ImagePlus, RotateCcw } from "lucide-react";
import Image from "next/image";

const MAX_LOGO_BYTES = 512 * 1024;

export function BrandingTab() {
  const { settings, updateBranding } = useSettings();
  const { branding } = settings;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      alert("Logo must be under 512 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateBranding({ logoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Company name" hint="Shown in the sidebar and on documents.">
            <SettingsInput
              value={branding.companyName}
              onChange={(e) => updateBranding({ companyName: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Product name" hint="Short label under the company name in the sidebar.">
            <SettingsInput
              value={branding.productName}
              onChange={(e) => updateBranding({ productName: e.target.value })}
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a square or wide logo. It appears in the sidebar and as the browser favicon. Stored
            locally in this browser until a database is connected.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {branding.logoDataUrl ? (
                <Image
                  src={branding.logoDataUrl}
                  alt="Company logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <ImagePlus className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer">
                <input type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
                <span className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
                  Upload logo
                </span>
              </label>
              {branding.logoDataUrl && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => updateBranding({ logoDataUrl: null })}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Accent color" hint="Buttons, links, and active states.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateBranding({ accentColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-slate-200"
              />
              <SettingsInput
                value={branding.accentColor}
                onChange={(e) => updateBranding({ accentColor: e.target.value })}
                className="font-mono"
              />
            </div>
          </SettingsField>
          <SettingsField label="Sidebar background" hint="Dark navigation panel color.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.sidebarColor}
                onChange={(e) => updateBranding({ sidebarColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-slate-200"
              />
              <SettingsInput
                value={branding.sidebarColor}
                onChange={(e) => updateBranding({ sidebarColor: e.target.value })}
                className="font-mono"
              />
            </div>
          </SettingsField>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            updateBranding({
              accentColor: "#2563eb",
              sidebarColor: "#0f172a",
            })
          }
        >
          <RotateCcw className="h-4 w-4" />
          Reset colors to default
        </Button>
      </div>
    </div>
  );
}
