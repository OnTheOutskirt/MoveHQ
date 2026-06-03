"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { DEMO_CREW_MEMBERS } from "@/lib/crew-app/session";
import { Smartphone } from "lucide-react";

export function CrewSettingsScreen() {
  const { session, setSession } = useCrewApp();

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Demo profile</h2>
        <p className="mt-1 text-xs text-slate-500">
          Foundation build — pick a crew member and role to preview different job layouts.
        </p>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-slate-600">Signed in as</span>
          <select
            value={session.crewId}
            onChange={(e) => {
              const member = DEMO_CREW_MEMBERS.find((m) => m.id === e.target.value);
              if (member) {
                setSession({
                  crewId: member.id,
                  name: member.name,
                  primaryRole: member.primaryRole,
                });
              }
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {DEMO_CREW_MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <CrewRoleSwitcher className="mt-4" />
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
        Crew app v0.1 · mock schedule & local demo session
      </p>
    </div>
  );
}
