"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { submitCrewOpsMessage } from "@/lib/crew-app/crew-ops-messages-storage";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { MessageSquareWarning } from "lucide-react";
import { useState } from "react";

type CrewHistoryJobDisputeFormProps = {
  job: CrewAppJob;
  hours: number;
  tips: number;
};

export function CrewHistoryJobDisputeForm({ job, hours, tips }: CrewHistoryJobDisputeFormProps) {
  const { session, refreshInbox } = useCrewApp();
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    submitCrewOpsMessage({
      crewId: session.crewId,
      crewName: session.name,
      body: `[${job.moveRef} · ${job.customerName}] ${body.trim()}`,
      flagOff: false,
      jobId: job.id,
      moveRef: job.moveRef,
    });
    refreshInbox();
    setBody("");
    setSent(true);
    window.setTimeout(() => setSent(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3"
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-950">
        <MessageSquareWarning className="h-3.5 w-3.5" />
        Report a discrepancy to operations
      </p>
      <p className="mt-0.5 text-[11px] text-amber-900/80">
        Hours on file: {hours}h · Tips (est.): ${tips}. Describe what doesn&apos;t match.
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="e.g. missing drive time, tips not recorded…"
        className="mt-2 w-full resize-y rounded-lg border border-amber-200/80 bg-white px-2.5 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!body.trim()}
        className="mt-2 w-full rounded-lg bg-amber-800 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Send to operations
      </button>
      {sent ? (
        <p className="mt-1.5 text-center text-xs font-medium text-emerald-800">Sent — ops will follow up.</p>
      ) : null}
    </form>
  );
}
