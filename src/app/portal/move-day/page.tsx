"use client";

import { MoveDayPortal } from "@/components/portal/MoveDayPortal";
import { useMoves } from "@/components/moves/MovesProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { readDispatchAssignments } from "@/lib/dispatch/storage";
import { getPublishRecord, readDispatchPublishStore } from "@/lib/dispatch/publish-storage";
import { resolveMoveDayPortalData } from "@/lib/moves/move-day-portal";
import { primaryMoveDate } from "@/lib/settings/pipeline-automation-runtime";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function MoveDayPortalPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { moves } = useMoves();
  const { crew } = useFleet();

  const moveId = searchParams.get("move");
  const dateParam = searchParams.get("date");

  const move = useMemo(
    () => (moveId ? moves.find((m) => m.id === moveId) : undefined),
    [moveId, moves],
  );

  const dateKey = dateParam ?? (move ? primaryMoveDate(move) : null);

  const portalData = useMemo(() => {
    if (!move || !dateKey) return null;
    const publishStore = readDispatchPublishStore();
    const isPublished = Boolean(getPublishRecord(publishStore, dateKey));
    return resolveMoveDayPortalData({
      move,
      dateKey,
      fleet: crew,
      assignments: readDispatchAssignments(),
      moves,
      isPublished,
    });
  }, [move, dateKey, crew, moves]);

  if (!moveId || !move || !dateKey || !portalData) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This move-day link is invalid or your crew lineup isn&apos;t ready yet.
        </p>
      </div>
    );
  }

  return (
    <MoveDayPortal
      data={portalData}
      companyName={settings.branding.companyName}
      logoDataUrl={settings.branding.logoDataUrl}
    />
  );
}
