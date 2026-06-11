"use client";

import type { CrewAppJob } from "@/lib/crew-app/types";
import { formatCrewJobPrice } from "@/lib/crew-app/mock-jobs";
import type { JobFieldState } from "@/lib/crew-app/job-field-storage";
import { CheckCircle2, PenLine, RefreshCw, Shield } from "lucide-react";

type SkipperJobWalkthroughPanelProps = {
  job: CrewAppJob;
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
};

export function SkipperJobWalkthroughPanel({
  job,
  state,
  onChange,
}: SkipperJobWalkthroughPanelProps) {
  const isFlat = job.quoteType === "flat";
  const signed = state.startSignature;

  function signStart() {
    onChange({
      ...state,
      startSignature: {
        signedAt: new Date().toISOString(),
        signedBy: job.customerName,
      },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600">
        Walk the customer through scope, pricing, and valuation before anyone touches a box.
        {isFlat ? " Confirm flat-rate scope hasn’t changed." : " Confirm hourly estimate assumptions."}
      </p>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Scope review</h2>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase text-slate-500">Agreed price</p>
            <p className="text-xl font-bold tabular-nums text-slate-900">{formatCrewJobPrice(job)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-100 p-2">
              <dt className="text-slate-500">Contents</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{job.contentsSummary}</dd>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <dt className="text-slate-500">Box count</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{job.boxCount} est.</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-slate-700">{job.liabilityCoverage}</span>
            </div>
            <button type="button" className="text-[10px] font-semibold text-brand-700">
              Change
            </button>
          </div>

          {isFlat ? (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-semibold text-amber-950"
            >
              <RefreshCw className="h-4 w-4" />
              Requote — scope changed
            </button>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Customer start sign-off</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Customer agrees to scope, price, and valuation — work can begin.
          </p>
        </div>
        <div className="p-4">
          {signed ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-4 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-emerald-900">Approved to start</p>
              <p className="text-xs text-emerald-800">{signed.signedBy}</p>
            </div>
          ) : (
            <>
              <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/30">
                <p className="text-sm text-slate-400">Customer signature</p>
              </div>
              <button
                type="button"
                onClick={signStart}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
              >
                <PenLine className="h-4 w-4" />
                Capture start sign-off
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
