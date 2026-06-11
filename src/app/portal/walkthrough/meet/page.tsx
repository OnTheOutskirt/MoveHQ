"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { formatMoveDate } from "@/lib/moves/format";
import { buildLiveSwitchRepMeetingUrl } from "@/lib/moves/walkthrough-meeting-links";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/** Customer landing for a booked virtual walkthrough — redirects to LiveSwitch at go-live. */
export default function PortalWalkthroughMeetPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { getMoveById } = useMoves();

  const moveId = searchParams.get("move")?.trim() ?? "";
  const assignee = searchParams.get("rep")?.trim() ?? "";
  const date = searchParams.get("date")?.trim() ?? "";
  const time = searchParams.get("time")?.trim() ?? "";

  const move = useMemo(() => (moveId ? getMoveById(moveId) : undefined), [moveId, getMoveById]);

  const liveSwitchUrl = useMemo(
    () => (moveId && assignee ? buildLiveSwitchRepMeetingUrl(moveId, assignee) : ""),
    [moveId, assignee],
  );

  const accent = settings.branding.accentColor;

  if (!moveId || !assignee || !move) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Meeting link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This virtual walkthrough link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
      <header
        className="px-6 py-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 72%, #0f172a) 100%)`,
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
          {settings.branding.companyName}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Virtual walkthrough</h1>
        <p className="mt-2 text-sm text-white/85">
          With <strong>{assignee}</strong>
          {date && time ? (
            <>
              {" "}
              · {formatMoveDate(date)} at {time}
            </>
          ) : null}
        </p>
      </header>

      <div className="space-y-5 px-5 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm">
          <p className="font-medium text-slate-900">{move.reference}</p>
          <p className="mt-1 text-slate-600">{move.customerName}</p>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          When it&apos;s time for your walkthrough, join the video room below. Works on phone or
          computer — no account needed.
        </p>

        {liveSwitchUrl ? (
          <a
            href={liveSwitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            Join video walkthrough
          </a>
        ) : null}

        <p className="text-center text-xs text-slate-500">
          Need help? Call{" "}
          {settings.company.phone ? (
            <Link href={`tel:${settings.company.phone}`} className="font-medium text-brand-600">
              {settings.company.phone}
            </Link>
          ) : (
            settings.branding.companyName
          )}
        </p>
      </div>
    </div>
  );
}
