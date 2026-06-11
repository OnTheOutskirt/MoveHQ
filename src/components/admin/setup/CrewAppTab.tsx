"use client";

import { CrewResourcesEditor } from "@/components/admin/setup/CrewResourcesEditor";
import { CrewAppRoleMultiSwitcher } from "@/components/crew-app/CrewAppRoleMultiSwitcher";
import { CrewPhoneFrame } from "@/components/crew-app/CrewPhoneFrame";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { PREVIEW_CREW_MEMBER } from "@/lib/crew-app/session";
import type { CrewAppRole } from "@/lib/crew-app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ExternalLink, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export function CrewAppTab() {
  const { settings } = useSettings();
  const { branding } = settings;
  const [jobRole, setJobRole] = useState<CrewAppRole>("skipper");
  const [appRoles, setAppRoles] = useState<CrewAppRole[]>(["skipper"]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollHostRef = useRef<HTMLDivElement>(null);

  const previewSrc = useMemo(() => {
    const params = new URLSearchParams({
      demoCrewId: PREVIEW_CREW_MEMBER.id,
      demoJobRole: jobRole,
      demoAppRoles: appRoles.join(","),
      embed: "1",
    });
    return `/crew/today?${params.toString()}`;
  }, [jobRole, appRoles]);

  const fullScreenSrc = useMemo(() => {
    const params = new URLSearchParams({
      demoCrewId: PREVIEW_CREW_MEMBER.id,
      demoJobRole: jobRole,
      demoAppRoles: appRoles.join(","),
      phoneFrame: "1",
    });
    return `/crew/today?${params.toString()}`;
  }, [jobRole, appRoles]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const host = scrollHostRef.current;
    if (!iframe || !host) return;

    function onWheel(e: WheelEvent) {
      const frame = iframeRef.current;
      const doc = frame?.contentDocument;
      const main = doc?.querySelector("main.crew-app-scroll");
      if (!main) return;
      main.scrollTop += e.deltaY;
      e.preventDefault();
    }

    function attach() {
      host!.addEventListener("wheel", onWheel, { passive: false });
    }

    iframe!.addEventListener("load", attach);
    attach();
    return () => {
      iframe!.removeEventListener("load", attach);
      host!.removeEventListener("wheel", onWheel);
    };
  }, [previewSrc]);

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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Phone preview as
                  </p>
                  <p className="text-sm font-medium text-slate-900">{PREVIEW_CREW_MEMBER.name}</p>
                </div>
              </div>
              <CrewRoleSwitcher
                label="Preview role for job"
                role={jobRole}
                onRoleChange={setJobRole}
                className="min-w-[12rem]"
              />
              <CrewAppRoleMultiSwitcher
                label="Preview roles for app"
                roles={appRoles}
                onRolesChange={setAppRoles}
                className="min-w-[12rem]"
              />
            </div>
            <Link
              href={fullScreenSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80"
              style={{ color: branding.accentColor }}
            >
              Open full screen
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <CrewPhoneFrame className="!min-h-0 !bg-transparent !p-0" hideDemoControls>
            <div
              ref={scrollHostRef}
              className="h-full overflow-hidden [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <iframe
                ref={iframeRef}
                key={previewSrc}
                title="Crew app preview"
                src={previewSrc}
                className="h-full w-full border-0 bg-slate-100"
              />
            </div>
          </CrewPhoneFrame>

          <p className="text-center text-xs text-slate-500">
            Job role controls workflow and job detail. App roles control stats and Today inventory
            — select skipper and driver together to preview both performance sections.
          </p>
        </CardContent>
      </Card>

      <CrewResourcesEditor />

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s in this build</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <ul className="list-inside list-disc space-y-1">
            <li>Today — combined load list + jobs (flat rate &amp; hourly demos)</li>
            <li>
              Schedule — upcoming days, history (past jobs &amp; hours), time off, message ops
            </li>
            <li>Stats — your issues log plus skipper or driver scores from operations</li>
            <li>Inbox — notifications for time off, schedule publishes, and more</li>
            <li>Resources — payroll &amp; benefits links (editable below)</li>
            <li>Message ops, job media, take-home sign-off, depot time on clock</li>
            <li>Skipper workflow — Prep · Clock · Start · Close out · Finish bottom nav</li>
            <li>Driver / mover — load checklist, schedule, and team (no pricing or workflow tabs)</li>
            <li>Mover route — ZIP codes only on cards and job detail</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
