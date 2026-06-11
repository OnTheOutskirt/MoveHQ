"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { Smartphone } from "lucide-react";

export function CrewSettingsScreen() {
  const { session } = useCrewApp();
  const { label: roleLabel } = useTerminology();

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Signed in</h2>
        <p className="mt-2 text-sm text-slate-800">{session.name}</p>
        <p className="text-xs text-slate-500">
          {session.appRoles.map((r) => roleLabel(r)).join(" · ")}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Smartphone className="h-4 w-4 text-brand-600" />
          Install app
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          On iPhone or Android, use <span className="font-medium">Add to Home Screen</span> from
          your browser menu. This PWA opens full-screen with your crew schedule.
        </p>
      </section>

      <p className="text-center text-[10px] text-slate-400">
        Crew app v0.2 · mock schedule from dispatch
      </p>
    </div>
  );
}
