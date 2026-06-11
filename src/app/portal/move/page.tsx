"use client";

import { CrewFeedbackPortal } from "@/components/portal/CrewFeedbackPortal";
import { MoveCustomerPortalHub } from "@/components/portal/MoveCustomerPortalHub";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { shouldShowCrewFeedbackPortal } from "@/lib/moves/move-customer-portal";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function MoveCustomerPortalPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { config } = useWorkspace();
  const { getMoveById, recordCrewFeedback } = useMoves();

  const moveId = searchParams.get("move");
  const previewFeedback = searchParams.get("preview") === "feedback";

  const move = useMemo(
    () => (moveId ? getMoveById(moveId) : undefined),
    [moveId, getMoveById],
  );

  if (!moveId || !move) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This customer portal link is invalid or the move is no longer available.
        </p>
      </div>
    );
  }

  const showFeedback = shouldShowCrewFeedbackPortal(move, { previewFeedback });

  if (showFeedback) {
    return (
      <CrewFeedbackPortal
        move={move}
        companyName={settings.branding.companyName}
        logoDataUrl={settings.branding.logoDataUrl}
        accentColor={settings.branding.accentColor}
        googleReviewMinStars={settings.defaults.postMoveGoogleReviewMinStars}
        locations={config.locations}
        existingFeedback={move.crewFeedback}
        onSubmit={(rating, comment) => recordCrewFeedback(moveId, rating, comment)}
      />
    );
  }

  return (
    <MoveCustomerPortalHub
      move={move}
      companyName={settings.branding.companyName}
      logoDataUrl={settings.branding.logoDataUrl}
      accentColor={settings.branding.accentColor}
    />
  );
}
