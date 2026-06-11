"use client";

import { CrewRoleBadges } from "@/components/dispatch/CrewRoleBadges";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveDayPortalData } from "@/lib/moves/move-day-portal";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";

type MoveDayPortalProps = {
  data: MoveDayPortalData;
  companyName: string;
  logoDataUrl?: string | null;
};

export function MoveDayPortal({ data, companyName, logoDataUrl }: MoveDayPortalProps) {
  const { label } = useTerminology();
  const { move, dateKey, crew, arrivalWindow, isPublished } = data;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl} alt="" className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              {companyName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{companyName}</p>
            <p className="text-xs text-slate-500">Move day preview</p>
          </div>
        </div>
      </header>

      <main className="space-y-5 px-5 py-5">
        <section>
          <h1 className="text-xl font-semibold text-slate-900">
            Hi{move.customerName ? `, ${move.customerName.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here&apos;s your crew for tomorrow&apos;s move.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-600" aria-hidden />
              {formatMoveDate(dateKey)}
            </span>
            {arrivalWindow ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-600" aria-hidden />
                Arrival {arrivalWindow}
              </span>
            ) : null}
          </div>
          {move.originAddress ? (
            <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span>{move.originAddress}</span>
            </p>
          ) : null}
        </section>

        {!isPublished ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Your final crew lineup will appear here once dispatch publishes the schedule — you&apos;ll
            get a text and email when it&apos;s ready.
          </p>
        ) : null}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your crew
          </h2>
          {crew.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Crew assignments are being finalized. We&apos;ll notify you when your team is set.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {crew.map((member) => (
                <li
                  key={member.id}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <CrewAvatar name={member.name} headshot={member.headshotDataUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <CrewRoleBadges roles={[member.primaryRole]} />
                      <span className="text-xs text-slate-500">{label(member.primaryRole)}</span>
                    </div>
                    {member.bio ? (
                      <p className="mt-1 text-sm leading-snug text-slate-600">{member.bio}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Questions? Reply to your confirmation text or call {companyName}.
        </p>
      </main>
    </div>
  );
}

function CrewAvatar({
  name,
  headshot,
}: {
  name: string;
  headshot?: string | null;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (headshot) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={headshot}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 ring-2 ring-white",
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
