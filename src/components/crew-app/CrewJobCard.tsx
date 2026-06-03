"use client";

import type { CrewAppJob } from "@/lib/crew-app/types";
import { jobProgressLabel, readJobFieldState } from "@/lib/crew-app/job-field-storage";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CrewJobCardProps = {
  job: CrewAppJob;
  className?: string;
};

export function CrewJobCard({ job, className }: CrewJobCardProps) {
  const { label: roleLabel } = useTerminology();
  const [progress, setProgress] = useState<ReturnType<typeof jobProgressLabel> | null>(null);

  useEffect(() => {
    setProgress(jobProgressLabel(readJobFieldState(job.id)));
  }, [job.id]);

  return (
    <Link
      href={`/crew/jobs/${job.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all active:scale-[0.99] active:shadow-md",
        className,
      )}
    >
      <div className="h-1 bg-gradient-to-r from-brand-600 to-brand-500" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 group-hover:text-brand-800">
              {job.customerName}
            </p>
            <p className="text-xs text-slate-500">
              {job.dayLabel} · {job.moveRef}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
              {roleLabel(job.myRole)}
            </span>
            {progress && progress !== "Not started" ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  progress === "Complete" && "bg-emerald-100 text-emerald-800",
                  progress === "On site" && "bg-amber-100 text-amber-900",
                )}
              >
                {progress}
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500/70" />
          <span className="line-clamp-2">
            {job.origin} → {job.destination}
          </span>
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
            {job.arrivalWindow ? (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Clock className="h-3 w-3 text-brand-600" />
                {job.arrivalWindow}
              </span>
            ) : null}
            {job.durationLabel ? <span>{job.durationLabel}</span> : null}
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
