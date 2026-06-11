"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { walkthroughDayOneOriginAddress } from "@/lib/moves/walkthroughs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const LIVESWITCH_DEMO_JOIN = "https://demo.liveswitch.io/jm-self-film";

/** Customer films their own items via LiveSwitch — no rep on the link. */
export default function PortalWalkthroughFilmPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { getMoveById } = useMoves();

  const moveId = searchParams.get("move")?.trim() ?? "";
  const move = useMemo(() => (moveId ? getMoveById(moveId) : undefined), [moveId, getMoveById]);
  const startingAddress = useMemo(
    () => (move ? walkthroughDayOneOriginAddress(move) : ""),
    [move],
  );

  const accent = settings.branding.accentColor;
  const joinUrl = moveId
    ? `${LIVESWITCH_DEMO_JOIN}?move=${encodeURIComponent(moveId)}`
    : "";

  if (!moveId || !move) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Filming link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This link is invalid or has expired. Contact {settings.branding.companyName} for a new one.
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Film your items</h1>
        <p className="mt-2 text-sm text-white/85">
          Walk through your home on video so we can prepare an accurate estimate — on your schedule.
        </p>
      </header>

      <div className="space-y-5 px-5 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm">
          <p className="font-medium text-slate-900">{move.reference}</p>
          <p className="mt-1 text-slate-600">{move.customerName}</p>
          {startingAddress ? (
            <p className="mt-2 text-xs text-slate-500">Starting at {startingAddress}</p>
          ) : null}
        </div>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Film each room — show furniture and boxes you&apos;re moving.</li>
          <li>Include closets, garage, and storage areas.</li>
          <li>Hold the phone steady and walk slowly.</li>
        </ol>

        {joinUrl ? (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            Start filming
          </a>
        ) : null}

        <p className="text-center text-xs text-slate-500">
          Questions?{" "}
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
