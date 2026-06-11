"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import {
  isShipperSelectionValid,
  ShipperPersonPicker,
  type ShipperPersonValue,
} from "@/components/moves/ShipperPersonPicker";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { salesMovePath } from "@/lib/navigation/routes";
import {
  addCustomPerson,
  getStoredPersonById,
  linkPersonToMove,
} from "@/lib/people/people-storage";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NewMoveDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function NewMoveDialog({ open, onClose }: NewMoveDialogProps) {
  const router = useRouter();
  const { createMove } = useMoves();
  const [shipper, setShipper] = useState<ShipperPersonValue>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShipper(null);
    setSubmitting(false);
    setFormStarted(false);
    setConfirmDiscardOpen(false);
  }, [open]);

  const requestClose = useCallback(() => {
    if (formStarted) {
      setConfirmDiscardOpen(true);
      return;
    }
    onClose();
  }, [formStarted, onClose]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (confirmDiscardOpen) return;
      e.preventDefault();
      requestClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, confirmDiscardOpen, requestClose]);

  function handleCreate() {
    if (!isShipperSelectionValid(shipper) || submitting || !shipper) return;

    setSubmitting(true);

    const person =
      shipper.mode === "existing"
        ? getStoredPersonById(shipper.personId)
        : addCustomPerson(shipper.draft);

    if (!person) {
      setSubmitting(false);
      return;
    }

    const moveId = createMove(person);
    if (shipper.mode === "new") {
      linkPersonToMove(person.id, moveId);
    }
    onClose();
    router.push(salesMovePath(moveId));
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-move-dialog-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
          aria-hidden
        />

        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Plus className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 id="new-move-dialog-title" className="text-lg font-semibold text-slate-900">
                  New move
                </h2>
                <p className="text-sm text-slate-500">Start a move in the pipeline</p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Shipper
              </span>
              <div className="mt-1.5">
                <ShipperPersonPicker
                  value={shipper}
                  onChange={setShipper}
                  onActivity={() => setFormStarted(true)}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Search your directory or add someone new — they&apos;ll be linked as the shipper on
                this move.
              </p>
            </label>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-center">
              <p className="text-sm font-medium text-slate-700">More to come</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Move scope details (addresses, services, inventory, and flat-rate quoting) will be
                added here once we finalize the flat-rate quoting form.
              </p>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!isShipperSelectionValid(shipper) || submitting}
            >
              Create move
            </Button>
          </footer>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={onClose}
        title="Discard new move?"
        description="You started entering shipper details. Close without saving and lose this draft?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="danger"
        zIndexClassName="z-[80]"
      />
    </>
  );
}
