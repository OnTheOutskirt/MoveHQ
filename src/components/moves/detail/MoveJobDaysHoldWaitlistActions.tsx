"use client";

import { MoveWaitlistDatesDialog } from "@/components/moves/detail/MoveWaitlistDatesDialog";
import { useCalendarPlacements } from "@/components/providers/CalendarPlacementProvider";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  holdAccentButtonStyle,
  waitlistAccentButtonStyle,
} from "@/lib/calendar/color-styles";
import {
  buildHoldDayDrafts,
  canPlaceMoveOnHold,
  validateHoldDrafts,
  waitlistDatesFromPlacements,
} from "@/lib/calendar/placement";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type MoveJobDaysHoldWaitlistActionsProps = {
  move: MoveRecord;
  waitlistDialogOpen?: boolean;
  onWaitlistDialogOpenChange?: (open: boolean) => void;
};

export function MoveJobDaysHoldWaitlistActions({
  move,
  waitlistDialogOpen: controlledDialogOpen,
  onWaitlistDialogOpenChange,
}: MoveJobDaysHoldWaitlistActionsProps) {
  const { colors } = useCalendarSettings();
  const {
    placeOnHold,
    setWaitlistDates,
    clearMovePlacements,
    getPlacementsForMove,
    placements,
  } = useCalendarPlacements();
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<"hold" | "waitlist" | null>(null);
  const waitlistDialogOpen = controlledDialogOpen ?? internalDialogOpen;
  const setWaitlistDialogOpen = onWaitlistDialogOpenChange ?? setInternalDialogOpen;

  const movePlacements = useMemo(
    () => getPlacementsForMove(move.id),
    [getPlacementsForMove, move.id],
  );
  const onHold = movePlacements.some((p) => p.kind === "hold");
  const onWaitlist = movePlacements.some((p) => p.kind === "waitlist");
  const existingWaitlistDates = useMemo(
    () => waitlistDatesFromPlacements(placements, move.id),
    [placements, move.id],
  );
  const canHold = canPlaceMoveOnHold(move);

  function handleHoldToggle() {
    if (onHold) {
      setConfirmRemove("hold");
      return;
    }
    const drafts = buildHoldDayDrafts(move);
    if (validateHoldDrafts(drafts)) return;
    placeOnHold(move, drafts);
  }

  function handleWaitlistClick() {
    if (onWaitlist) {
      setConfirmRemove("waitlist");
      return;
    }
    setWaitlistDialogOpen(true);
  }

  function handleWaitlistConfirm(dates: string[]) {
    setWaitlistDates(move, dates);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleHoldToggle}
          disabled={!onHold && !canHold}
          title={!canHold && !onHold ? "Add job days before placing on hold" : undefined}
          className={cn(onHold && "border-2 font-semibold shadow-sm")}
          style={onHold ? holdAccentButtonStyle(colors) : undefined}
        >
          {onHold ? "Remove holds" : "Place on hold"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleWaitlistClick}
          className={cn(onWaitlist && "border-2 font-semibold shadow-sm")}
          style={onWaitlist ? waitlistAccentButtonStyle(colors) : undefined}
        >
          {onWaitlist ? "Remove waitlist" : "Add to waitlist"}
        </Button>
      </div>

      <MoveWaitlistDatesDialog
        open={waitlistDialogOpen}
        move={move}
        existingDates={existingWaitlistDates}
        onClose={() => setWaitlistDialogOpen(false)}
        onConfirm={handleWaitlistConfirm}
      />

      <ConfirmDialog
        open={confirmRemove === "hold"}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => clearMovePlacements(move.id, "hold")}
        title="Remove holds?"
        description="This will release reserved movers and trucks on all job days for this move."
        confirmLabel="Remove holds"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmRemove === "waitlist"}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => clearMovePlacements(move.id, "waitlist")}
        title="Remove from waitlist?"
        description="This move will be removed from the waitlist on all selected dates."
        confirmLabel="Remove waitlist"
        variant="danger"
      />
    </>
  );
}
