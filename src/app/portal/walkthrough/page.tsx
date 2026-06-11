"use client";

import { WalkthroughSchedulingPortal } from "@/components/portal/WalkthroughSchedulingPortal";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { parseWalkthroughLinkSearchParams } from "@/lib/moves/walkthrough-scheduling-link";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PortalWalkthroughPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { getMoveById } = useMoves();

  const linkParams = useMemo(
    () => parseWalkthroughLinkSearchParams(searchParams),
    [searchParams],
  );

  const move = useMemo(
    () => (linkParams ? getMoveById(linkParams.moveId) : undefined),
    [linkParams, getMoveById],
  );

  const accent = settings.branding.accentColor;

  if (!linkParams || !move) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Scheduling link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This walkthrough link is invalid or has expired. Contact {settings.branding.companyName}{" "}
          to request a new one.
        </p>
        {settings.company.phone ? (
          <Link
            href={`tel:${settings.company.phone}`}
            className="mt-4 text-sm font-medium text-brand-600 hover:underline"
          >
            {settings.company.phone}
          </Link>
        ) : null}
      </div>
    );
  }

  if (
    move.conditionStatus === "lost" ||
    move.conditionStatus === "cancelled" ||
    move.conditionStatus === "closed"
  ) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Move no longer active</p>
        <p className="mt-2 text-sm text-slate-500">
          This move is closed — reach out to {settings.branding.companyName} if you still need a
          walkthrough.
        </p>
      </div>
    );
  }

  return (
    <WalkthroughSchedulingPortal
      move={move}
      assignee={linkParams.assignee}
      linkMode={linkParams.mode}
      companyName={settings.branding.companyName}
      logoDataUrl={settings.branding.logoDataUrl}
      accentColor={accent}
      companyPhone={settings.company.phone}
    />
  );
}
