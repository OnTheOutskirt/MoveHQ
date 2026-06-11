"use client";

import { CrewFieldCapturePanel } from "@/components/crew-app/CrewFieldCapturePanel";
import type { CrewAppJob } from "@/lib/crew-app/types";
import type { JobFieldState } from "@/lib/crew-app/job-field-storage";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileWarning,
  PenLine,
} from "lucide-react";
import { useState } from "react";

type SkipperJobSignOffPanelProps = {
  job: CrewAppJob;
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
};

export function SkipperJobSignOffPanel({ job, state, onChange }: SkipperJobSignOffPanelProps) {
  const [claimsNote, setClaimsNote] = useState("");
  const [endName, setEndName] = useState(job.customerName);
  const needsPayment = !job.paymentCardOnFile;

  function signEnd() {
    onChange({
      ...state,
      endSignature: {
        signedAt: new Date().toISOString(),
        signedBy: endName.trim() || job.customerName,
      },
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Final customer sign-off</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Walk through completed work, note any damage, and get approval to run payment.
        </p>

        {state.endSignature ? (
          <div className="mt-4 space-y-2">
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50">
              <p className="font-serif text-2xl italic text-slate-700">{state.endSignature.signedBy}</p>
            </div>
            <p className="text-center text-xs text-slate-500">
              Signed {new Date(state.endSignature.signedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-slate-600">Customer name</label>
            <input
              value={endName}
              onChange={(e) => setEndName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/30">
              <p className="text-sm text-slate-400">Final signature</p>
            </div>
            <button
              type="button"
              disabled={!state.startSignature}
              onClick={signEnd}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold",
                state.startSignature
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              <PenLine className="h-4 w-4" />
              Capture final signature
            </button>
            {!state.startSignature ? (
              <p className="text-center text-xs text-slate-500">
                Complete start sign-off on the Start tab first.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <FileWarning className="h-3.5 w-3.5" />
          Claims &amp; damage
        </h2>
        <textarea
          value={claimsNote}
          onChange={(e) => setClaimsNote(e.target.value)}
          rows={3}
          placeholder="Note any damage, missing items, or customer concerns…"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </section>

      <CrewFieldCapturePanel
        job={job}
        variant="compact"
        defaultCategory="claim_damage"
        title="Damage photos"
        subtitle="Claim / new damage or pre-existing — routes to claims and move file."
      />

      <section
        className={cn(
          "overflow-hidden rounded-2xl border shadow-sm",
          needsPayment ? "border-red-300 bg-red-50" : "border-emerald-200 bg-white",
        )}
      >
        {needsPayment ? (
          <div className="flex items-start gap-3 border-b border-red-200 bg-red-100/80 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-700" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-900">
                Need payment!!!
              </p>
              <p className="mt-0.5 text-xs text-red-800">
                No card on file — collect payment before leaving site.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/80 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900">Card on file — ready to charge</p>
          </div>
        )}

        <div className="p-4">
          {needsPayment ? (
            <>
              <button
                type="button"
                className="w-full rounded-xl bg-red-700 py-3 text-sm font-semibold text-white"
              >
                Log payment received
              </button>
              <p className="mt-2 text-center text-[11px] text-red-800/80">
                Cash, check, or manual card entry — syncs when payments go live.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!state.endSignature}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
                  state.endSignature
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                <CreditCard className="h-4 w-4" />
                Run payment on saved card
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Stripe charge — connects at go-live
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
