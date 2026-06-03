"use client";

import { CrewSignaturePanel } from "@/components/crew-app/skipper/CrewSignaturePanel";
import { CrewTimeClockPanel } from "@/components/crew-app/skipper/CrewTimeClockPanel";
import type { CrewAppJob } from "@/lib/crew-app/types";
import {
  jobProgressLabel,
  readJobFieldState,
  writeJobFieldState,
  type JobFieldState,
} from "@/lib/crew-app/job-field-storage";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const TABS = [
  { id: "details" as const, label: "Details" },
  { id: "time" as const, label: "Time" },
  { id: "sign" as const, label: "Sign-off" },
];

type SkipperJobDetailProps = {
  job: CrewAppJob;
  details: React.ReactNode;
};

export function SkipperJobDetail({ job, details }: SkipperJobDetailProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("details");
  const [fieldState, setFieldState] = useState<JobFieldState>(() => readJobFieldState(job.id));

  useEffect(() => {
    setFieldState(readJobFieldState(job.id));
  }, [job.id]);

  function updateFieldState(next: JobFieldState) {
    setFieldState(next);
    writeJobFieldState(job.id, next);
  }

  const progress = jobProgressLabel(fieldState);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Job status
          </p>
          <p className="text-sm font-semibold text-slate-900">{progress}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            progress === "Complete" && "bg-emerald-100 text-emerald-800",
            progress === "On site" && "bg-brand-100 text-brand-800",
            progress === "Not started" && "bg-slate-100 text-slate-600",
          )}
        >
          {progress}
        </span>
      </div>

      <div className="flex rounded-xl bg-slate-200/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
              tab === t.id
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "details" ? details : null}
      {tab === "time" ? (
        <CrewTimeClockPanel state={fieldState} onChange={updateFieldState} />
      ) : null}
      {tab === "sign" ? (
        <CrewSignaturePanel
          customerName={job.customerName}
          state={fieldState}
          onChange={updateFieldState}
        />
      ) : null}
    </div>
  );
}
