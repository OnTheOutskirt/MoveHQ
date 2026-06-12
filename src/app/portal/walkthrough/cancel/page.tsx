"use client";

import { WalkthroughCancelPortal } from "@/components/portal/WalkthroughCancelPortal";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  buildWalkthroughSchedulingPath,
  parseWalkthroughCancelSearchParams,
} from "@/lib/moves/walkthrough-scheduling-link";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PortalWalkthroughCancelPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { getMoveById } = useMoves();

  const cancelParams = useMemo(
    () => parseWalkthroughCancelSearchParams(searchParams),
    [searchParams],
  );

  const move = useMemo(
    () => (cancelParams ? getMoveById(cancelParams.moveId) : undefined),
    [cancelParams, getMoveById],
  );

  const schedulingPath = useMemo(() => {
    if (!move) return undefined;
    const assignee = move.scheduledWalkthrough?.assignedTo;
    if (!assignee) return undefined;
    const mode = move.scheduledWalkthrough?.mode ?? "in_person";
    return buildWalkthroughSchedulingPath({
      moveId: move.id,
      assignee,
      mode,
    });
  }, [move]);

  if (!cancelParams || !move) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Cancel link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This link is invalid or has expired. Contact {settings.branding.companyName} for help.
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

  return (
    <WalkthroughCancelPortal
      move={move}
      companyName={settings.branding.companyName}
      accentColor={settings.branding.accentColor}
      companyPhone={settings.company.phone}
      schedulingPath={schedulingPath}
    />
  );
}
