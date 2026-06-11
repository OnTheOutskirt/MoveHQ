"use client";

import { CrewJobMediaPanel } from "@/components/crew-app/CrewJobMediaPanel";
import { CrewLoadChecklist } from "@/components/crew-app/CrewLoadChecklist";
import { CrewTakeHomeSignOffPanel } from "@/components/crew-app/CrewTakeHomeSignOffPanel";
import type { CrewAppJob, CrewAppRole } from "@/lib/crew-app/types";
import { formatAddressForRole, isSkipperRole } from "@/lib/crew-app/role-access";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { ClipboardList, MapPin, Truck, Users } from "lucide-react";

type CrewMemberJobDetailProps = {
  job: CrewAppJob;
  role: CrewAppRole;
};

export function CrewMemberJobDetail({ job, role }: CrewMemberJobDetailProps) {
  const { label: roleLabel, plural: rolePluralLabel } = useTerminology();

  return (
    <div className="space-y-4">
      {isSkipperRole(role) ? (
        <CrewLoadChecklist
          scope="job"
          job={job}
          title="Materials for this job"
          subtitle="Check off as you load — syncs with Today"
          doneTitle="All items loaded for this job"
          doneSubtitle="This job's shop list is on the truck."
        />
      ) : null}

      <ScheduleBlock job={job} />
      <RouteBlock job={job} role={role} />
      <CrewJobMediaPanel job={job} />
      {isSkipperRole(role) ? <CrewTakeHomeSignOffPanel job={job} /> : null}

      {role === "driver" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Truck className="h-3.5 w-3.5" />
            Truck
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-900">{job.trucks.join(", ")}</p>
        </section>
      ) : null}

      {role === "mover" ? (
        <>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Services</h2>
            <p className="mt-2 text-sm text-slate-800">{job.services.join(" · ")}</p>
          </section>
          {job.accessNotes ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Access</h2>
              <p className="mt-2 text-sm text-slate-800">{job.accessNotes}</p>
            </section>
          ) : null}
        </>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Users className="h-3.5 w-3.5" />
          {rolePluralLabel("mover")}
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {job.crew.map((slot, i) => (
            <li key={i} className="flex justify-between gap-2 text-slate-800">
              <span>{slot.name}</span>
              <span className="text-xs text-slate-500">{roleLabel(slot.role)}</span>
            </li>
          ))}
        </ul>
      </section>

      {role === "driver" && job.dispatchNotes ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
          <h2 className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
            <ClipboardList className="h-3 w-3" />
            Dispatch notes
          </h2>
          <p className="mt-1 text-sm leading-snug text-amber-950">{job.dispatchNotes}</p>
        </section>
      ) : null}

      <p className="text-center text-[10px] text-slate-400">
        Published {new Date(job.publishedAt).toLocaleString()} · {job.moveRef}
      </p>
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

function RouteBlock({ job, role }: { job: CrewAppJob; role: CrewAppRole }) {
  const zipOnly = role === "mover";

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        Route
        {zipOnly ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">(ZIP only)</span>
        ) : null}
      </h2>
      <dl className="mt-2 space-y-2 text-sm">
        <div>
          <dt className="text-[10px] text-slate-500">From</dt>
          <dd className="text-slate-900">{formatAddressForRole(job.origin, role)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500">To</dt>
          <dd className="text-slate-900">{formatAddressForRole(job.destination, role)}</dd>
        </div>
      </dl>
    </section>
  );
}
