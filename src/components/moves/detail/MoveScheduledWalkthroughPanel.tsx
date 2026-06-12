"use client";

import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { MoveRecord } from "@/lib/moves/types";
import {
  formatWalkthroughMode,
  formatWalkthroughScheduleLine,
  resolveMoveWalkthrough,
} from "@/lib/moves/walkthroughs";
import { CalendarClock, MapPin, UserRound, Video } from "lucide-react";
import { useState } from "react";

type MoveScheduledWalkthroughPanelProps = {
  move: MoveRecord;
  onReschedule?: () => void;
};

/** Banner when a walkthrough is booked — date, mode, assignee, cancel, and confirmation email. */
export function MoveScheduledWalkthroughPanel({
  move,
  onReschedule,
}: MoveScheduledWalkthroughPanelProps) {
  const { cancelWalkthrough } = useMovesActions();
  const walkthrough = resolveMoveWalkthrough(move);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  if (!walkthrough || walkthrough.status !== "scheduled") return null;

  const ModeIcon = walkthrough.mode === "virtual" ? Video : MapPin;

  function handleCancel() {
    cancelWalkthrough(move.id, { cancelledBy: "staff" });
    setCancelConfirmOpen(false);
  }

  return (
    <>
      <section className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
              Walkthrough scheduled
            </p>
            <p className="text-sm font-medium text-indigo-900">
              {formatWalkthroughScheduleLine(walkthrough)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-indigo-900/90">
              <ModeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {formatWalkthroughMode(walkthrough.mode)}
              {walkthrough.location ? ` · ${walkthrough.location}` : null}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-indigo-800/80">
              <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
              With {walkthrough.assignedTo}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {onReschedule ? (
              <Button type="button" size="sm" variant="secondary" onClick={onReschedule}>
                Reschedule
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="text-red-700 hover:bg-red-50"
              onClick={() => setCancelConfirmOpen(true)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel walkthrough?"
        description={`Remove the ${formatWalkthroughScheduleLine(walkthrough)} appointment with ${walkthrough.assignedTo}? The move will return to needs walkthrough.`}
        confirmLabel="Yes, cancel"
        cancelLabel="Keep scheduled"
        variant="danger"
      />
    </>
  );
}
