"use client";

import { useState } from "react";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";

type MarkMoveLostActionProps = {
  move: MoveRecord;
  className?: string;
};

export function MarkMoveLostAction({ move, className }: MarkMoveLostActionProps) {
  const { markAsLost, reopenMove } = useMoves();
  const lost = isMoveLost(move);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (lost) {
    return (
      <div className={className}>
        <Button type="button" size="sm" variant="secondary" onClick={() => reopenMove(move.id)}>
          Re-open move
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
        onClick={() => setConfirmOpen(true)}
      >
        Mark as lost
      </Button>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setConfirmOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Mark move as lost?</h2>
            <p className="mt-1 text-sm text-slate-600">
              This move will leave the active pipeline. You can re-open it later if needed.
            </p>
            <label className="mt-4 block text-sm">
              <span className="font-medium text-slate-700">Reason (optional)</span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Chose competitor, cancelled move…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  markAsLost(move.id, reason.trim() || undefined);
                  setConfirmOpen(false);
                  setReason("");
                }}
              >
                Mark as lost
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
