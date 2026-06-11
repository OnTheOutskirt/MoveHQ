"use client";

import { SkipperJobClockPanel } from "@/components/crew-app/skipper/SkipperJobClockPanel";
import { SkipperJobDetailsPanel } from "@/components/crew-app/skipper/SkipperJobDetailsPanel";
import { SkipperJobSignOffPanel } from "@/components/crew-app/skipper/SkipperJobSignOffPanel";
import { SkipperJobWalkthroughPanel } from "@/components/crew-app/skipper/SkipperJobWalkthroughPanel";
import { SkipperJobWrapUpPanel } from "@/components/crew-app/skipper/SkipperJobWrapUpPanel";
import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { hasLaterJobSameDay } from "@/lib/crew-app/mock-jobs";
import type { CrewAppJob } from "@/lib/crew-app/types";
import {
  jobProgressLabel,
  readJobFieldState,
  writeJobFieldState,
  type JobFieldState,
} from "@/lib/crew-app/job-field-storage";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  CreditCard,
  ClipboardCheck,
  PenLine,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SECTIONS = [
  { id: "prep" as const, label: "Prep", icon: ClipboardList },
  { id: "clock" as const, label: "Clock", icon: Timer },
  { id: "start" as const, label: "Start", icon: PenLine },
  { id: "closeout" as const, label: "Close out", icon: ClipboardCheck },
  { id: "finish" as const, label: "Finish", icon: CreditCard },
];

type SkipperSection = (typeof SECTIONS)[number]["id"];

type SkipperJobDetailProps = {
  job: CrewAppJob;
};

export function SkipperJobDetail({ job }: SkipperJobDetailProps) {
  const { myJobs } = useCrewApp();
  const [section, setSection] = useState<SkipperSection>("prep");
  const [fieldState, setFieldState] = useState<JobFieldState>(() => readJobFieldState(job.id));

  const hasMoreJobsToday = useMemo(
    () => hasLaterJobSameDay(myJobs, job),
    [myJobs, job],
  );

  useEffect(() => {
    setFieldState(readJobFieldState(job.id));
    setSection("prep");
  }, [job.id]);

  function updateFieldState(next: JobFieldState) {
    setFieldState(next);
    writeJobFieldState(job.id, next);
  }

  const progress = jobProgressLabel(fieldState);

  return (
    <div className="pb-24">
      <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
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

      {section === "prep" ? <SkipperJobDetailsPanel job={job} /> : null}
      {section === "clock" ? (
        <SkipperJobClockPanel
          job={job}
          state={fieldState}
          onChange={updateFieldState}
          hasMoreJobsToday={hasMoreJobsToday}
        />
      ) : null}
      {section === "start" ? (
        <SkipperJobWalkthroughPanel
          job={job}
          state={fieldState}
          onChange={updateFieldState}
        />
      ) : null}
      {section === "closeout" ? (
        <SkipperJobWrapUpPanel
          job={job}
          state={fieldState}
          onChange={updateFieldState}
        />
      ) : null}
      {section === "finish" ? (
        <SkipperJobSignOffPanel job={job} state={fieldState} onChange={updateFieldState} />
      ) : null}

      <p className="mt-4 text-center text-[10px] text-slate-400">
        {job.moveRef} · {job.quoteType === "flat" ? "Flat rate" : "Hourly"}
      </p>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
        aria-label="Job workflow"
      >
        <ul className="mx-auto flex max-w-lg">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id} className="flex-1">
              <JobNavButton
                label={label}
                icon={Icon}
                active={section === id}
                onClick={() => setSection(id)}
                badge={
                  id === "start" && fieldState.startSignature
                    ? "done"
                    : id === "finish" && fieldState.endSignature
                      ? "done"
                      : undefined
                }
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function JobNavButton({
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  badge?: "done";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[9px] font-semibold transition-colors",
        active ? "text-brand-700" : "text-slate-500 hover:text-slate-800",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
          active && "bg-brand-50 text-brand-700",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {label}
      {badge === "done" ? (
        <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      ) : null}
    </button>
  );
}
