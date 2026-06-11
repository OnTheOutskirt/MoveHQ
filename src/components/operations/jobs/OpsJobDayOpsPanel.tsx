"use client";

import { opsPackingNote, opsSupplyLines, opsThirdPartyLines } from "@/lib/operations/ops-job-summary";
import { jobDayDriveDisplay } from "@/lib/operations/job-day-drive";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { Clock, Package, Truck, Wrench } from "lucide-react";

type OpsJobDayOpsPanelProps = {
  move: MoveRecord;
  jobDay: MoveJobDay;
  onDriveHoursChange: (hours: number | null) => void;
  /** Drive time is edited in Job Info est vs actual table. */
  hideDriveSection?: boolean;
};

export function OpsJobDayOpsPanel({
  move,
  jobDay,
  onDriveHoursChange,
  hideDriveSection,
}: OpsJobDayOpsPanelProps) {
  const intake = move.intake;
  const { supplies, equipment } = opsSupplyLines(intake);
  const thirdParty = opsThirdPartyLines(intake);
  const packing = opsPackingNote(intake);
  const drive = jobDayDriveDisplay(jobDay, move);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
        <Wrench className="h-3.5 w-3.5" aria-hidden />
        Ops prep — move scope
      </p>

      {!hideDriveSection ? (
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Clock className="h-3 w-3" />
            Drive time (crew travel)
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500">Estimated</p>
              <p className="text-sm font-medium text-slate-800">{drive.estimated} hrs</p>
            </div>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Actual</span>
              <input
                type="number"
                min={0}
                step={0.25}
                value={drive.actual ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  onDriveHoursChange(raw === "" ? null : Number(raw));
                }}
                placeholder={String(drive.estimated)}
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums"
              />
              <span className="text-[10px] text-slate-500">hours</span>
            </label>
          </div>
        </div>
      ) : null}

      {packing || intake.specialtyNotes ? (
        <div className="mt-3 text-sm text-slate-700">
          {packing ? <p>{packing}</p> : null}
          {intake.specialtyNotes ? (
            <p className="mt-1 text-xs text-amber-900">{intake.specialtyNotes}</p>
          ) : null}
        </div>
      ) : null}

      {supplies.length > 0 ? (
        <OpsLineGroup icon={Package} title="Supplies on move" lines={supplies} />
      ) : null}

      {equipment.length > 0 ? (
        <OpsLineGroup icon={Truck} title="Equipment" lines={equipment} />
      ) : null}

      {thirdParty.length > 0 ? (
        <ul className="mt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Third-party services
          </p>
          {thirdParty.map((line, i) => (
            <li key={i} className="rounded-md border border-violet-100 bg-violet-50/50 px-2.5 py-2 text-sm">
              <p className="font-medium text-slate-900">{line.service}</p>
              <p className="text-xs text-slate-600">{line.vendor}</p>
              {line.cost ? <p className="text-xs text-slate-500">{line.cost} est.</p> : null}
              {line.notes ? <p className="mt-0.5 text-xs text-slate-600">{line.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {supplies.length === 0 &&
      equipment.length === 0 &&
      thirdParty.length === 0 &&
      !packing &&
      !intake.specialtyNotes ? (
        <p className="mt-3 text-sm text-slate-500">
          No supplies, equipment, or vendors on this move yet — add them on the move record under
          Equipment &amp; supplies.
        </p>
      ) : null}
    </section>
  );
}

function OpsLineGroup({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Package;
  title: string;
  lines: { label: string; quantity: number; priceNote: string }[];
}) {
  return (
    <ul className="mt-3 space-y-1">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3 w-3" />
        {title}
      </p>
      {lines.map((line, i) => (
        <li key={i} className="flex justify-between gap-2 text-sm text-slate-800">
          <span>
            {line.quantity} × {line.label}
          </span>
          <span className="shrink-0 text-xs text-slate-500">{line.priceNote}</span>
        </li>
      ))}
    </ul>
  );
}
