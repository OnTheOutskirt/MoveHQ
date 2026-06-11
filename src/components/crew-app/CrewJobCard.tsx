"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import type { CrewAppJob } from "@/lib/crew-app/types";
import {
  canSeePricing,
  formatRouteForRole,
  isSkipperRole,
} from "@/lib/crew-app/role-access";
import { formatCrewJobPrice } from "@/lib/crew-app/mock-jobs";
import {
  emptyJobFieldState,
  isJobComplete,
  jobProgressLabel,
  readJobFieldState,
  subscribeJobFieldStore,
} from "@/lib/crew-app/job-field-storage";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CrewJobCardProps = {
  job: CrewAppJob;
  className?: string;
};

function formatCompleteTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CrewJobCard({ job, className }: CrewJobCardProps) {
  const { crewPath, session, isClientReady } = useCrewApp();
  const { label: roleLabel } = useTerminology();
  const [fieldState, setFieldState] = useState(emptyJobFieldState);
  const role = session.jobRole;
  const showPricing = canSeePricing(role);

  useEffect(() => {
    function refresh() {
      setFieldState(readJobFieldState(job.id));
    }
    refresh();
    return subscribeJobFieldStore(refresh);
  }, [job.id]);

  const progress = jobProgressLabel(fieldState);
  const complete = isJobComplete(fieldState);
  const completedAt = fieldState.jobCompleteAt ?? fieldState.endSignature?.signedAt;
  const jobHref = isClientReady ? crewPath(`/crew/jobs/${job.id}`) : `/crew/jobs/${job.id}`;

  if (complete) {
    return (
      <Link
        href={jobHref}
        className={cn(
          "group flex items-center gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-3 py-2.5 shadow-sm transition-all active:scale-[0.99]",
          className,
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-emerald-950">{job.customerName}</p>
          <p className="mt-0.5 text-[11px] text-emerald-800/90">
            Complete
            {completedAt ? ` · ${formatCompleteTime(completedAt)}` : ""}
            <span className="text-emerald-700/70"> · {job.moveRef}</span>
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-emerald-400 group-hover:text-emerald-600"
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <Link
      href={jobHref}
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
            {showPricing ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  job.quoteType === "flat"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900",
                )}
              >
                {job.quoteType === "flat" ? "Flat" : "Hourly"}
              </span>
            ) : null}
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
              {roleLabel(role)}
            </span>
            {isSkipperRole(role) && progress !== "Not started" ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
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
            {formatRouteForRole(job.origin, job.destination, role)}
          </span>
        </p>
        {showPricing ? (
          <p className="mt-1.5 text-xs font-semibold tabular-nums text-slate-800">
            {formatCrewJobPrice(job)}
          </p>
        ) : null}
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
