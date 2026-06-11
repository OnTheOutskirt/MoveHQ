"use client";

import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import { parseTermsSections } from "@/lib/settings/document-terms-defaults";
import { pricingKindFromVars } from "@/lib/settings/document-accent";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DocumentTermsSectionProps = {
  termsHourly: string;
  termsFlat: string;
  vars: Record<string, string>;
  kind: DocumentSendKind;
  accentColor: string;
  requireAcceptance?: boolean;
};

export function DocumentTermsSection({
  termsHourly,
  termsFlat,
  vars,
  kind,
  accentColor,
  requireAcceptance = kind === "contract",
}: DocumentTermsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const pricingKind = pricingKindFromVars(vars);
  const termsText = pricingKind === "flat" ? termsFlat : termsHourly;
  const label =
    pricingKind === "flat" ? "Flat rate terms & conditions" : "Hourly terms & conditions";

  useEffect(() => {
    setAccepted(false);
  }, [termsText, kind]);

  if (!termsText.trim()) return null;

  return (
    <>
      <section className="rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <FileText className="h-3.5 w-3.5" />
          Terms & conditions
        </p>

        {requireAcceptance ? (
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded border-slate-300"
              style={{ accentColor }}
            />
            <span>
              I have read and agree to the{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
                className="font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-current"
                style={{ color: accentColor }}
              >
                {label}
              </button>
            </span>
          </label>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Review our{" "}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-current"
              style={{ color: accentColor }}
            >
              {label}
            </button>{" "}
            before booking.
          </p>
        )}

        {requireAcceptance && !accepted ? (
          <p className="mt-2 text-xs text-slate-500">
            You must accept the terms before signing.
          </p>
        ) : null}
      </section>

      <TermsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={label}
        termsText={termsText}
        accentColor={accentColor}
      />
    </>
  );
}

function TermsModal({
  open,
  onClose,
  title,
  termsText,
  accentColor,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  termsText: string;
  accentColor: string;
}) {
  const sections = useMemo(() => parseTermsSections(termsText), [termsText]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

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

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close terms"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="relative flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <header
          className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 8%, white) 0%, white 100%)`,
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: accentColor }}
            >
              Legal
            </p>
            <h2 id="terms-modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            {sections.map((section, i) => {
              const isOpen = expanded[i] ?? i === 0;
              return (
                <div
                  key={`${section.title}-${i}`}
                  className="overflow-hidden rounded-xl border border-slate-200/90 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [i]: !isOpen }))}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900">{section.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-400 transition",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-slate-100 px-3.5 pb-3.5 pt-2 text-xs leading-relaxed text-slate-600">
                      {section.body}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
