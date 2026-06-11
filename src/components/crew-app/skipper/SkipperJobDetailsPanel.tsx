"use client";

import type { CrewAppJob } from "@/lib/crew-app/types";
import { CrewFieldCapturePanel } from "@/components/crew-app/CrewFieldCapturePanel";
import { CrewLoadChecklist } from "@/components/crew-app/CrewLoadChecklist";
import { formatCrewJobPrice } from "@/lib/crew-app/mock-jobs";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  MapPin,
  Pencil,
  Phone,
  Shield,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

type SkipperJobDetailsPanelProps = {
  job: CrewAppJob;
};

export function SkipperJobDetailsPanel({ job }: SkipperJobDetailsPanelProps) {
  const { label: roleLabel, plural: rolePluralLabel } = useTerminology();
  const isFlat = job.quoteType === "flat";

  return (
    <div className="space-y-4">
      <CrewLoadChecklist
        scope="job"
        job={job}
        title="Materials for this job"
        subtitle="Check off as you load — syncs with Today (partial qty until all jobs loaded)"
        doneTitle="All items loaded for this job"
        doneSubtitle="This job's shop list is on the truck."
      />

      <section
        className={cn(
          "rounded-2xl border p-4 shadow-sm",
          isFlat ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {isFlat ? (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-700" />
                  Flat rate
                </>
              ) : (
                <>Hourly estimate</>
              )}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {formatCrewJobPrice(job)}
            </p>
          </div>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {job.moveRef}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-slate-500">Boxes est.</dt>
            <dd className="font-medium text-slate-900">{job.boxCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Liability</dt>
            <dd className="font-medium text-slate-900">{job.liabilityCoverage}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{job.contentsSummary}</p>
      </section>

      <CrewFieldCapturePanel job={job} defaultCategory="truck_condition" />

      <ScheduleBlock job={job} />
      <RouteBlock job={job} />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Truck className="h-3.5 w-3.5" />
            Truck
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700"
          >
            <Pencil className="h-3 w-3" />
            Change
          </button>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-900">{job.trucks.join(", ")}</p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {rolePluralLabel("mover")}
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700"
          >
            <Pencil className="h-3 w-3" />
            Change
          </button>
        </div>
        <ul className="mt-2 space-y-1.5">
          {job.crew.map((slot, i) => (
            <li key={i} className="flex justify-between gap-2 text-sm text-slate-800">
              <span>{slot.name}</span>
              <span className="text-xs text-slate-500">{roleLabel(slot.role)}</span>
            </li>
          ))}
        </ul>
      </section>

      {job.accessNotes ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Access</h2>
          <p className="mt-2 text-sm text-slate-800">{job.accessNotes}</p>
        </section>
      ) : null}

      {job.customerPhone ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            Customer
          </h2>
          <a href={`tel:${job.customerPhone}`} className="mt-2 inline-block text-sm font-medium text-brand-700">
            {job.customerPhone}
          </a>
        </section>
      ) : null}

      {job.dispatchNotes ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
          <h2 className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
            <ClipboardList className="h-3 w-3" />
            Dispatch notes
          </h2>
          <p className="mt-1 text-sm leading-snug text-amber-950">{job.dispatchNotes}</p>
        </section>
      ) : null}

      {job.officeFees.length > 0 ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            Office fees on file
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {job.officeFees.map((fee) => (
              <li key={fee.id} className="flex justify-between gap-2 text-slate-800">
                <span>
                  {fee.label}
                  {fee.appliesTo === "hourly" ? (
                    <span className="ml-1 text-[10px] text-amber-700">(hourly)</span>
                  ) : null}
                </span>
                <span className="font-medium tabular-nums">${fee.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ScheduleBlock({ job }: { job: CrewAppJob }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</h2>
      <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] text-slate-500">Depart shop</dt>
          <dd className="font-medium text-slate-900">{job.departureWindow ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500">Arrive customer</dt>
          <dd className="font-medium text-slate-900">{job.arrivalWindow ?? "—"}</dd>
        </div>
        {job.durationLabel ? (
          <div className="col-span-2">
            <dt className="text-[10px] text-slate-500">Duration</dt>
            <dd className="font-medium text-slate-900">{job.durationLabel}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function RouteBlock({ job }: { job: CrewAppJob }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        Route
      </h2>
      <dl className="mt-2 space-y-2 text-sm">
        <div>
          <dt className="text-[10px] text-slate-500">From</dt>
          <dd className="text-slate-900">{job.origin}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500">To</dt>
          <dd className="text-slate-900">{job.destination}</dd>
        </div>
      </dl>
    </section>
  );
}
