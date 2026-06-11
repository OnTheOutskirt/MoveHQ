"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewMemberJobDetail } from "@/components/crew-app/CrewMemberJobDetail";
import { SkipperJobDetail } from "@/components/crew-app/skipper/SkipperJobDetail";
import { isSkipperRole } from "@/lib/crew-app/role-access";
import { formatMoveDate } from "@/lib/moves/format";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type CrewJobDetailScreenProps = {
  jobId: string;
};

export function CrewJobDetailScreen({ jobId }: CrewJobDetailScreenProps) {
  const { getJob, session, crewPath } = useCrewApp();
  const job = getJob(jobId);
  const { label: roleLabel } = useTerminology();

  if (!job) notFound();

  const isSkipper = isSkipperRole(session.jobRole);

  return (
    <CrewAppShell
      hideNav
      title={job.customerName}
      subtitle={`${job.dayLabel} · ${formatMoveDate(job.dateKey)}`}
    >
      <Link
        href={crewPath("/crew/today")}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to today
      </Link>

      <div className="space-y-4">
        {!isSkipper ? (
          <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800">
              Your role today
            </p>
            <p className="text-sm font-semibold text-slate-900">{roleLabel(session.jobRole)}</p>
          </div>
        ) : null}

        {isSkipper ? (
          <SkipperJobDetail job={job} />
        ) : (
          <CrewMemberJobDetail job={job} role={session.jobRole} />
        )}
      </div>
    </CrewAppShell>
  );
}
