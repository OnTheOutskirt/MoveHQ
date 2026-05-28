"use client";

import { useEffect, useMemo, useState } from "react";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  findLostReasonOption,
  LOST_QUALIFICATION_HINTS,
  LOST_QUALIFICATION_LABELS,
  lostReasonsForQualification,
  type LostQualification,
  type MarkLostPayload,
} from "@/lib/moves/lost-reasons";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type MarkMoveLostActionProps = {
  move: MoveRecord;
  className?: string;
  buttonLabel?: string;
};

type DialogStep = "qualification" | "reason";

export function MarkMoveLostAction({
  move,
  className,
  buttonLabel = "Mark lost",
}: MarkMoveLostActionProps) {
  const { markAsLost, reopenMove } = useMoves();
  const lost = isMoveLost(move);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("qualification");
  const [qualification, setQualification] = useState<LostQualification | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const reasonOptions = useMemo(
    () => (qualification ? lostReasonsForQualification(qualification) : []),
    [qualification],
  );

  const selectedReason = qualification && reasonId
    ? findLostReasonOption(qualification, reasonId)
    : undefined;

  const canConfirm = Boolean(qualification && reasonId);

  function resetDialog() {
    setStep("qualification");
    setQualification(null);
    setReasonId(null);
    setNotes("");
  }

  function closeDialog() {
    setOpen(false);
    resetDialog();
  }

  function openDialog() {
    resetDialog();
    setOpen(true);
  }

  function handleConfirm() {
    if (!qualification || !reasonId) return;
    const payload: MarkLostPayload = {
      qualification,
      reasonId,
      notes: notes.trim() || undefined,
    };
    markAsLost(move.id, payload);
    closeDialog();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDialog();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

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
        onClick={openDialog}
      >
        {buttonLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mark-lost-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeDialog}
            aria-label="Close"
          />
          <div className="relative flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 id="mark-lost-title" className="text-lg font-semibold text-slate-900">
                Mark move as lost
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {step === "qualification"
                  ? "Choose whether this was a real opportunity or an unqualified lead. The move leaves the active pipeline."
                  : `Select why this ${qualification === "unqualified" ? "lead" : "opportunity"} was lost.`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step === "qualification" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["unqualified", "qualified"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setQualification(q);
                        setReasonId(null);
                        setStep("reason");
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left transition-colors",
                        qualification === q
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      <span className="block text-sm font-semibold text-slate-900">
                        {LOST_QUALIFICATION_LABELS[q]}
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-slate-600">
                        {LOST_QUALIFICATION_HINTS[q]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {qualification ? LOST_QUALIFICATION_LABELS[qualification] : ""}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-medium text-brand-600 hover:text-brand-800"
                      onClick={() => {
                        setStep("qualification");
                        setReasonId(null);
                      }}
                    >
                      Change type
                    </button>
                  </div>

                  <ul className="space-y-1.5" role="listbox" aria-label="Lost reason">
                    {reasonOptions.map((option) => {
                      const selected = reasonId === option.id;
                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => setReasonId(option.id)}
                            className={cn(
                              "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                              selected
                                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <span className="font-medium text-slate-900">{option.label}</span>
                            {option.description ? (
                              <span className="mt-0.5 block text-xs text-slate-600">
                                {option.description}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <label className="block text-sm">
                    <span className="font-medium text-slate-700">Additional notes (optional)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder={
                        selectedReason?.id.endsWith("_other")
                          ? "Briefly describe what happened…"
                          : "Anything else for the activity log…"
                      }
                      className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={closeDialog}>
                Cancel
              </Button>
              {step === "reason" ? (
                <Button
                  type="button"
                  variant="danger"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                >
                  Mark as lost
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
