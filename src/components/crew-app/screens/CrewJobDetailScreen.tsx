"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { SkipperJobDetail } from "@/components/crew-app/skipper/SkipperJobDetail";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Phone,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type CrewJobDetailScreenProps = {
  jobId: string;
};

export function CrewJobDetailScreen({ jobId }: CrewJobDetailScreenProps) {
  const { getJob } = useCrewApp();
  const job = getJob(jobId);
  const { label: roleLabel, plural: rolePluralLabel } = useTerminology();

  if (!job) notFound();

  const isSkipper = job.myRole === "skipper";

  return (
    <CrewAppShell
      hideNav
      title={job.customerName}
      subtitle={`${job.dayLabel} · ${formatMoveDate(job.dateKey)}`}
    >
      <Link
        href="/crew/today"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to today
      </Link>

      <CrewRoleSwitcher className="mb-4" />

      <div className="space-y-4">
        {!isSkipper ? (
          <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800">
              Your role today
            </p>
            <p className="text-sm font-semibold text-slate-900">{roleLabel(job.myRole)}</p>
          </div>
        ) : null}

        {isSkipper ? (
          <SkipperJobDetail
            job={job}
            details={
              <>
                <ScheduleSection job={job} />
                <RouteSection job={job} />
                <CrewRoster
                  job={job}
                  roleLabel={roleLabel}
                  rolePluralLabel={rolePluralLabel}
                />
                <TrucksSection job={job} />
                {job.customerPhone ? <ContactSection phone={job.customerPhone} /> : null}
                {job.dispatchNotes ? <DispatchNotes notes={job.dispatchNotes} /> : null}
                <PublishedFooter job={job} />
              </>
            }
          />
        ) : (
          <>
            <ScheduleSection job={job} />
            <RouteSection job={job} />
            {job.myRole === "driver" ? (
              <DriverSections job={job} roleLabel={roleLabel} />
            ) : null}
            {job.myRole === "mover" ? <MoverSections job={job} roleLabel={roleLabel} /> : null}
            <PublishedFooter job={job} />
          </>
        )}
      </div>
    </CrewAppShell>
  );
}

function ScheduleSection({ job }: { job: CrewAppJob }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</h2>
      <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] text-slate-500">Depart</dt>
          <dd className="font-medium text-slate-900">{job.departureWindow ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-slate-500">Arrive</dt>
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

function RouteSection({ job }: { job: CrewAppJob }) {
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

function DriverSections({
  job,
  roleLabel,
}: {
  job: CrewAppJob;
  roleLabel: (r: CrewAppJob["myRole"]) => string;
}) {
  return (
    <>
      <TrucksSection job={job} emphasize />
      <CrewRoster job={job} roleLabel={roleLabel} rolePluralLabel={roleLabel} compact />
      {job.dispatchNotes ? <DispatchNotes notes={job.dispatchNotes} /> : null}
      <PlaceholderSection
        title="Driving checklist"
        body="Pre-trip, fuel, and route-specific notes will appear here."
      />
    </>
  );
}

function MoverSections({
  job,
  roleLabel,
}: {
  job: CrewAppJob;
  roleLabel: (r: CrewAppJob["myRole"]) => string;
}) {
  return (
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
      <CrewRoster job={job} roleLabel={roleLabel} rolePluralLabel={roleLabel} compact />
      <PlaceholderSection
        title="Your tasks"
        body="Room checklist, photos, and clock in/out will be added in the next crew app phase."
      />
    </>
  );
}

function CrewRoster({
  job,
  roleLabel,
  rolePluralLabel,
  compact,
}: {
  job: CrewAppJob;
  roleLabel: (r: CrewAppJob["myRole"]) => string;
  rolePluralLabel: (r: CrewAppJob["myRole"]) => string;
  compact?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Users className="h-3.5 w-3.5" />
        {compact ? "Team" : rolePluralLabel("mover")}
      </h2>
      <ul className={cn("mt-2 space-y-1.5", compact && "text-sm")}>
        {job.crew.map((slot, i) => (
          <li key={i} className="flex justify-between gap-2 text-slate-800">
            <span>{slot.name}</span>
            <span className="text-xs text-slate-500">{roleLabel(slot.role)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrucksSection({ job, emphasize }: { job: CrewAppJob; emphasize?: boolean }) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        emphasize ? "border-amber-200 bg-amber-50/50" : "border-slate-200/80",
      )}
    >
      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Truck className="h-3.5 w-3.5" />
        Trucks
      </h2>
      <p className="mt-2 text-sm font-medium text-slate-900">{job.trucks.join(", ")}</p>
    </section>
  );
}

function ContactSection({ phone }: { phone: string }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Phone className="h-3.5 w-3.5" />
        Customer
      </h2>
      <a href={`tel:${phone}`} className="mt-2 inline-block text-sm font-medium text-brand-700">
        {phone}
      </a>
    </section>
  );
}

function DispatchNotes({ notes }: { notes: string }) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
      <h2 className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
        <ClipboardList className="h-3 w-3" />
        Dispatch notes
      </h2>
      <p className="mt-1 text-sm leading-snug text-amber-950">{notes}</p>
    </section>
  );
}

function PlaceholderSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3">
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{body}</p>
    </section>
  );
}

function PublishedFooter({ job }: { job: CrewAppJob }) {
  return (
    <p className="text-center text-[10px] text-slate-400">
      Published {new Date(job.publishedAt).toLocaleString()} · {job.moveRef}
    </p>
  );
}
