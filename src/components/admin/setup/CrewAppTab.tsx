"use client";

import { CrewResourcesEditor } from "@/components/admin/setup/CrewResourcesEditor";
import { CrewAppRoleMultiSwitcher } from "@/components/crew-app/CrewAppRoleMultiSwitcher";
import { CrewPhoneFrame } from "@/components/crew-app/CrewPhoneFrame";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { TabBar } from "@/components/shared/TabBar";
import { PREVIEW_CREW_MEMBER } from "@/lib/crew-app/session";
import type { CrewAppRole } from "@/lib/crew-app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ExternalLink, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const MOBILE_APP_TABS = [
  { id: "crew", label: "Crew App" },
  { id: "operations", label: "Operations App" },
  { id: "sales", label: "Sales App" },
] as const;

type MobileAppTab = (typeof MOBILE_APP_TABS)[number]["id"];

export function CrewAppTab() {
  const [tab, setTab] = useState<MobileAppTab>("crew");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Mobile apps</h2>
      </div>

      <TabBar tabs={MOBILE_APP_TABS} activeTab={tab} onChange={setTab} />

      {tab === "crew" ? <CrewAppPanel /> : null}
      {tab === "operations" ? (
        <ComingSoonPanel
          title="Operations app"
          description="Field operations experience — coming soon."
        />
      ) : null}
      {tab === "sales" ? (
        <ComingSoonPanel
          title="Sales app"
          description="On-the-go sales experience — coming soon."
        />
      ) : null}
    </div>
  );
}

function ComingSoonPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
    </Card>
  );
}

function CrewAppPanel() {
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Card className="min-w-0 overflow-hidden">
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

      <div className="min-w-0 lg:sticky lg:top-4">
        <CrewResourcesEditor />
      </div>
    </div>
  );
}
