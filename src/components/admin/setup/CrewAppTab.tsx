"use client";

import { TerminologyTab } from "@/components/admin/setup/TerminologyTab";
import { useSettings } from "@/components/providers/SettingsProvider";
import { DEMO_CREW_MEMBERS } from "@/lib/crew-app/session";
import type { CrewAppRole } from "@/lib/crew-app/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ExternalLink, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const ROLES: CrewAppRole[] = ["skipper", "driver", "mover"];

export function CrewAppTab() {
  const { settings } = useSettings();
  const { branding } = settings;
  const { label: roleLabel } = useTerminology();
  const [crewId, setCrewId] = useState(DEMO_CREW_MEMBERS[0]!.id);
  const [role, setRole] = useState<CrewAppRole>("skipper");

  const previewSrc = useMemo(() => {
    const params = new URLSearchParams({ demoCrewId: crewId, demoRole: role });
    return `/crew/today?${params.toString()}`;
  }, [crewId, role]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader
          className="border-b border-slate-100"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${branding.accentColor} 8%, white) 0%, white 60%)`,
          }}
        >
          <CardTitle className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: branding.accentColor }}
            >
              <Smartphone className="h-4 w-4" />
            </span>
            Crew app preview
          </CardTitle>
          <p className="text-sm text-slate-500">
            Progressive web app at{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">/crew</code> — uses your MoveHQ
            branding. Dispatch &quot;Send to crew app&quot; will feed this schedule later.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="block min-w-[12rem]">
              <span className="text-xs font-medium text-slate-600">Preview as</span>
              <select
                value={crewId}
                onChange={(e) => setCrewId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {DEMO_CREW_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-xs font-medium text-slate-600">Role</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      role === r
                        ? "border-transparent text-white shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                    )}
                    style={
                      role === r
                        ? { backgroundColor: branding.accentColor }
                        : undefined
                    }
                  >
                    {roleLabel(r)}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href={previewSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80"
              style={{ color: branding.accentColor }}
            >
              Open full screen
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mx-auto max-w-[420px]">
            <div
              className="rounded-[2.5rem] p-3 shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${branding.sidebarColor} 0%, color-mix(in srgb, ${branding.sidebarColor} 70%, ${branding.accentColor}) 100%)`,
              }}
            >
              <div className="mb-2 flex items-center justify-center gap-2 px-2">
                {branding.logoDataUrl ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-md bg-white/10">
                    <Image
                      src={branding.logoDataUrl}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                ) : null}
                <p className="text-[11px] font-semibold tracking-wide text-white/90">
                  {branding.companyName} Crew
                </p>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] bg-slate-900 shadow-inner ring-1 ring-white/10">
                <div className="relative mx-auto h-5 w-28 rounded-b-xl bg-slate-900" aria-hidden />
                <iframe
                  key={previewSrc}
                  title="Crew app preview"
                  src={previewSrc}
                  className="h-[min(72vh,720px)] w-full border-0 bg-slate-100"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Switch role above to preview mover, driver, or skipper job views — open a job for
              full detail.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s in this build</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <ul className="list-inside list-disc space-y-1">
            <li>Today — two demo jobs with greeting and next-up summary</li>
            <li>Role preview — mover, driver, or skipper job detail layouts</li>
            <li>Skipper flow — time clock and customer sign-off on job detail</li>
            <li>Stats — issues from Operations → Crew track record</li>
            <li>Branding — accent and sidebar colors from MoveHQ settings</li>
          </ul>
        </CardContent>
      </Card>

      <TerminologyTab />
    </div>
  );
}
