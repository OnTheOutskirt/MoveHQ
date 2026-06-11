"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import {
  readJobFieldState,
  writeJobFieldState,
  subscribeJobFieldStore,
  type TakeHomeSignOff,
} from "@/lib/crew-app/job-field-storage";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";

type CrewTakeHomeSignOffPanelProps = {
  job: CrewAppJob;
};

export function CrewTakeHomeSignOffPanel({ job }: CrewTakeHomeSignOffPanelProps) {
  const { bumpLoadChecklist } = useCrewApp();
  const [signOff, setSignOff] = useState<TakeHomeSignOff | null>(
    () => readJobFieldState(job.id).takeHomeSignOff,
  );
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState(job.customerName);
  const [reason, setReason] = useState<TakeHomeSignOff["reason"]>("customer_gift");

  useEffect(() => {
    function sync() {
      setSignOff(readJobFieldState(job.id).takeHomeSignOff);
    }
    sync();
    return subscribeJobFieldStore(sync);
  }, [job.id]);

  function save() {
    const state = readJobFieldState(job.id);
    const next: TakeHomeSignOff = {
      description: description.trim(),
      reason,
      customerName: customerName.trim(),
      customerSignedAt: new Date().toISOString(),
    };
    writeJobFieldState(job.id, { ...state, takeHomeSignOff: next });
    setSignOff(next);
    bumpLoadChecklist();
  }

  if (signOff) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
        <p className="text-sm font-semibold text-emerald-900">Take-home sign-off recorded</p>
        <p className="mt-1 text-xs text-emerald-800">{signOff.description}</p>
        <p className="mt-1 text-xs text-emerald-700">
          Signed by {signOff.customerName} · {signOff.reason.replace("_", " ")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Package className="h-4 w-4 text-brand-600" />
        Items taken home
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Customer giveaway or donation — client signs before items leave the home.
      </p>
      <div className="mt-3 space-y-2">
        <label className="block text-xs font-medium text-slate-600">
          What is being taken?
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="e.g. old couch to donation center"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as TakeHomeSignOff["reason"])}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="customer_gift">Customer giving away</option>
            <option value="donation">Donation haul</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Customer name (signature)
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={!description.trim()}
          className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Record customer sign-off
        </button>
      </div>
    </section>
  );
}
