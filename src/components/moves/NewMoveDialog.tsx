"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { salesMovePath } from "@/lib/navigation/routes";
import { addCustomPerson } from "@/lib/people/people-storage";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, Plus, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NewMoveDialogProps = {
  open: boolean;
  onClose: () => void;
};

type QuoteMode = "flat" | "hourly";

export function NewMoveDialog({ open, onClose }: NewMoveDialogProps) {
  const router = useRouter();
  const { createMove, updateMoveQuote } = useMoves();
  const [quoteMode, setQuoteMode] = useState<QuoteMode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuoteMode(null);
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
    if (!quoteMode || submitting) return;

    setSubmitting(true);

    const person = addCustomPerson({
      name: "New customer",
      phone: "",
      email: "",
    });

    const moveId = createMove(person);
    updateMoveQuote(moveId, { quoteType: quoteMode });
    onClose();
    router.push(salesMovePath(moveId));
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-stretch justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-move-dialog-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
          aria-hidden
        />

        <div className="relative flex min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {quoteMode ? (
                <button
                  type="button"
                  onClick={() => setQuoteMode(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  aria-label="Back to quote type"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Plus className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <h2 id="new-move-dialog-title" className="text-lg font-semibold text-slate-900">
                  New move
                </h2>
                <p className="text-sm text-slate-500">
                  {quoteMode
                    ? quoteMode === "flat"
                      ? "Flat-rate quote — customer intake embed"
                      : "Hourly quote — office intake form"
                    : "Choose how this move will be quoted"}
                </p>
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

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {!quoteMode ? (
              <div className="mx-auto max-w-3xl space-y-4">
                <p className="text-sm text-slate-600">
                  Start with the quote type. Customer and move details come from the intake form —
                  no shipper lookup up front.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteMode("flat");
                      setFormStarted(true);
                    }}
                    className={cn(
                      "rounded-2xl border-2 p-6 text-left transition-colors",
                      "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-base font-semibold text-slate-900">Flat rate</p>
                    <p className="mt-1 text-sm text-slate-500">
                      AI / Chakor web intake — embedded quote form (iframe).
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteMode("hourly");
                      setFormStarted(true);
                    }}
                    className={cn(
                      "rounded-2xl border-2 p-6 text-left transition-colors",
                      "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                      <Clock className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-base font-semibold text-slate-900">Hourly</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Office staff build scope, crew size, and hourly rate on the phone or in person.
                    </p>
                  </button>
                </div>
              </div>
            ) : quoteMode === "flat" ? (
              <div className="flex min-h-[min(520px,60vh)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Flat-rate intake (embed preview)
                  </p>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                    iframe
                  </span>
                </div>
                <iframe
                  title="Flat-rate quote intake preview"
                  className="min-h-[420px] w-full flex-1 border-0 bg-white"
                  srcDoc={`<!DOCTYPE html><html><head><style>
                    body { margin:0; font-family: system-ui, sans-serif; background:#f8fafc; color:#334155; }
                    .wrap { padding: 2rem; max-width: 40rem; margin: 0 auto; }
                    h1 { font-size: 1.125rem; margin: 0 0 0.5rem; color:#0f172a; }
                    p { font-size: 0.875rem; line-height: 1.5; margin: 0; }
                    .box { margin-top: 1.5rem; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 3rem; text-align:center; background:#fff; }
                  </style></head><body><div class="wrap"><h1>Chakor flat-rate intake</h1><p>Live embed will load here — rooms, access, packing, and photos.</p><div class="box">Flat-rate quoting iframe placeholder</div></div></body></html>`}
                />
              </div>
            ) : (
              <div className="flex min-h-[min(520px,60vh)] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80">
                <p className="text-lg font-medium text-slate-500">[hourly form]</p>
              </div>
            )}
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button type="button" variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!quoteMode || submitting}
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
        description="Close without saving this draft?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="danger"
        zIndexClassName="z-[80]"
      />
    </>
  );
}
