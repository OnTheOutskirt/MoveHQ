"use client";

import { DispatchDayRequirementsBar } from "@/components/dispatch/DispatchDayRequirementsBar";
import { DispatchResourcesPanel } from "@/components/dispatch/DispatchResourcesPanel";
import { DispatchDayPicker } from "@/components/dispatch/DispatchDayPicker";
import { DispatchPublishActions } from "@/components/dispatch/DispatchPublishActions";
import { DispatchJobCard } from "@/components/dispatch/DispatchJobCard";
import { DispatchJobSidebar } from "@/components/dispatch/DispatchJobSidebar";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMeta } from "@/lib/navigation/page-meta";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

const meta = pageMeta["/operations/dispatch"];

export function DispatchWorkspace() {
  const { day } = useDispatch();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <>
      <div className="-m-4 flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex-col overflow-hidden lg:-m-6">
        <div className="shrink-0 space-y-4 px-4 pt-2 pb-5 lg:px-6">
          <PageHeader title={meta.title} description={meta.description} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <DispatchDayPicker />
            <DispatchPublishActions />
          </div>

          <DispatchDayRequirementsBar />

          {day.importantNotes ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {day.importantNotes}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 lg:flex-row lg:gap-4 lg:px-6 lg:pb-6">
          <DispatchResourcesPanel />

          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ClipboardList className="h-3.5 w-3.5" />
                Jobs · {day.jobs.length}
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              {day.jobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-sm text-slate-600">No jobs scheduled for this day.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Job days on booked moves appear here.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {day.jobs.map((job) => (
                    <li key={job.id}>
                      <DispatchJobCard
                        job={job}
                        selected={selectedJobId === job.id}
                        onSelect={() => setSelectedJobId(job.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <DispatchJobSidebar jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
    </>
  );
}
