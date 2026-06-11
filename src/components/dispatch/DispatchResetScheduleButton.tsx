"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

export function DispatchResetScheduleButton() {
  const { day, hasCustomSchedule, resetDaySchedule } = useDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (day.jobs.length === 0) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={!hasCustomSchedule}
        onClick={() => setConfirmOpen(true)}
        className="h-7 text-[11px] text-slate-500 hover:text-slate-800"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset schedule
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={resetDaySchedule}
        title="Reset schedule for this day?"
        description="Timeline positions, pairings, crew and truck assignments, and combined skipper/driver slots will all return to their defaults for this day. Job notes are kept."
        confirmLabel="Reset schedule"
        variant="danger"
      />
    </>
  );
}
