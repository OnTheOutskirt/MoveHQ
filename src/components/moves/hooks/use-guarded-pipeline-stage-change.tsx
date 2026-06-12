"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import {
  getManualStageChangeConfirm,
  requiresWaitingReasonOnStageChange,
  requiresWalkthroughScheduledSubstageConfirm,
  waitingReasonDialogDescription,
  waitingReasonDialogTitle,
  walkthroughScheduledWithoutBookingConfirm,
} from "@/lib/moves/pipeline-stage-change";
import type { MoveRecord, PipelineStageId, WaitingSubstage } from "@/lib/moves/types";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type PendingConfirm = {
  moveId: string;
  targetStage: PipelineStageId;
  title: string;
  description: string;
};

type PendingWaiting = {
  moveId: string;
};

export function useGuardedPipelineStageChange() {
  const { updateMovePipelineStage, getMoveById } = useMoves();
  const { settings } = useSettings();
  const substageOptions = settings.fieldCatalog.waitingSubstages;

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [pendingWaiting, setPendingWaiting] = useState<PendingWaiting | null>(null);
  const [pendingWalkthroughSubstage, setPendingWalkthroughSubstage] = useState<{
    moveId: string;
    substage: WaitingSubstage;
  } | null>(null);
  const [selectedWaitingReason, setSelectedWaitingReason] = useState<WaitingSubstage | "">("");

  useEffect(() => {
    if (!pendingWaiting) setSelectedWaitingReason("");
  }, [pendingWaiting]);

  const applyStageChange = useCallback(
    (
      moveId: string,
      targetStage: PipelineStageId,
      options?: { waitingSubstage?: WaitingSubstage },
    ) => {
      updateMovePipelineStage(moveId, targetStage, options);
    },
    [updateMovePipelineStage],
  );

  const requestStageChange = useCallback(
    (move: MoveRecord, targetStage: PipelineStageId) => {
      if (isMoveLost(move) || move.pipelineStage === targetStage) return;

      if (requiresWaitingReasonOnStageChange(move.pipelineStage, targetStage)) {
        setSelectedWaitingReason(move.waitingSubstage ?? "");
        setPendingWaiting({ moveId: move.id });
        return;
      }

      const confirm = getManualStageChangeConfirm(move.pipelineStage, targetStage);
      if (confirm) {
        setPendingConfirm({
          moveId: move.id,
          targetStage,
          title: confirm.title,
          description: confirm.description,
        });
        return;
      }

      applyStageChange(move.id, targetStage);
    },
    [applyStageChange],
  );

  const walkthroughConfirmCopy = walkthroughScheduledWithoutBookingConfirm();

  const pipelineStageChangeDialogs = (
    <>
      <ConfirmDialog
        open={pendingConfirm !== null}
        onClose={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (!pendingConfirm) return;
          applyStageChange(pendingConfirm.moveId, pendingConfirm.targetStage);
          setPendingConfirm(null);
        }}
        title={pendingConfirm?.title ?? ""}
        description={pendingConfirm?.description ?? ""}
        confirmLabel="Yes, move stage"
        cancelLabel="Cancel"
      />

      <ConfirmDialog
        open={pendingWalkthroughSubstage !== null}
        onClose={() => setPendingWalkthroughSubstage(null)}
        onConfirm={() => {
          if (!pendingWalkthroughSubstage) return;
          applyStageChange(pendingWalkthroughSubstage.moveId, "waiting", {
            waitingSubstage: pendingWalkthroughSubstage.substage,
          });
          setPendingWalkthroughSubstage(null);
        }}
        title={walkthroughConfirmCopy.title}
        description={walkthroughConfirmCopy.description}
        confirmLabel="Yes, continue"
        cancelLabel="Cancel"
      />

      <WaitingReasonDialog
        open={pendingWaiting !== null}
        selectedReason={selectedWaitingReason}
        onReasonChange={setSelectedWaitingReason}
        substageOptions={substageOptions}
        onClose={() => setPendingWaiting(null)}
        onConfirm={() => {
          if (!pendingWaiting || !selectedWaitingReason) return;
          const move = getMoveById(pendingWaiting.moveId);
          if (
            move &&
            requiresWalkthroughScheduledSubstageConfirm(move, selectedWaitingReason)
          ) {
            setPendingWalkthroughSubstage({
              moveId: pendingWaiting.moveId,
              substage: selectedWaitingReason,
            });
            setPendingWaiting(null);
            return;
          }
          applyStageChange(pendingWaiting.moveId, "waiting", {
            waitingSubstage: selectedWaitingReason,
          });
          setPendingWaiting(null);
        }}
      />
    </>
  );

  return { requestStageChange, pipelineStageChangeDialogs };
}

function WaitingReasonDialog({
  open,
  selectedReason,
  onReasonChange,
  substageOptions,
  onClose,
  onConfirm,
}: {
  open: boolean;
  selectedReason: WaitingSubstage | "";
  onReasonChange: (value: WaitingSubstage | "") => void;
  substageOptions: FieldCatalogEntry[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedDescription =
    substageOptions.find((option) => option.id === selectedReason)?.description ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waiting-reason-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="waiting-reason-dialog-title" className="text-lg font-semibold text-slate-900">
          {waitingReasonDialogTitle()}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{waitingReasonDialogDescription()}</p>

        <div className="relative mt-4">
          <label
            htmlFor="waiting-reason-select"
            className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Waiting reason
          </label>
          <select
            id="waiting-reason-select"
            value={selectedReason}
            onChange={(e) => onReasonChange(e.target.value as WaitingSubstage | "")}
            className={cn(
              "mt-1 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-800",
              "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
              !selectedReason && "text-slate-500",
            )}
          >
            <option value="" disabled>
              Select reason…
            </option>
            {substageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute bottom-2.5 right-3 h-4 w-4 text-slate-400"
            aria-hidden
          />
        </div>

        {selectedDescription ? (
          <p className="mt-2 text-xs text-slate-500">{selectedDescription}</p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Required to move into Waiting.</p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedReason} onClick={onConfirm}>
            Move to Waiting
          </Button>
        </div>
      </div>
    </div>
  );
}
