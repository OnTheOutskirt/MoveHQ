"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import { formatMoveDate } from "@/lib/moves/format";
import {
  intakeHearAboutLabel,
  intakeJobTypeLabel,
} from "@/lib/moves/intake-display";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailIntakeTabProps = {
  move: MoveRecord;
};

export function MoveDetailIntakeTab({ move }: MoveDetailIntakeTabProps) {
  const { intake } = move;

  return (
    <div className="space-y-4">
      <DetailSection title="Client & move date">
        <DetailFieldGrid>
          <DetailField label="Client name" value={intake.clientName} />
          <DetailField label="Phone" value={intake.clientPhone} />
          <DetailField label="Email" value={intake.clientEmail || "—"} />
          <DetailField label="Target move date" value={formatMoveDate(intake.moveDate)} />
          <DetailField
            label="How did you hear about us?"
            value={intakeHearAboutLabel(intake.hearAboutUs)}
            fullWidth
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Job type">
        <DetailFieldGrid>
          <DetailField label="Type" value={intakeJobTypeLabel(intake.jobType)} fullWidth />
          {intake.jobType === "load-unload-only" && intake.loadUnloadDirection ? (
            <>
              <DetailField
                label="Direction"
                value={intake.loadUnloadDirection === "loading" ? "Loading" : "Unloading"}
              />
              <DetailField label="Container" value={intake.containerType ?? "—"} />
            </>
          ) : null}
        </DetailFieldGrid>
        {intake.jobType === "in-facility" ? (
          <p className="mt-3 text-xs text-amber-800">
            In-facility move — single address; destination hidden on intake.
          </p>
        ) : null}
        {intake.jobType === "in-home-rearrange" ? (
          <p className="mt-3 text-xs text-amber-800">
            In-home rearrange — origin and destination are the same home.
          </p>
        ) : null}
        {intake.jobType === "pack-only" ? (
          <p className="mt-3 text-xs text-amber-800">Pack only — no destination on intake.</p>
        ) : null}
        {intake.jobType === "unpack-only" ? (
          <p className="mt-3 text-xs text-amber-800">Unpack only — no origin pickup on intake.</p>
        ) : null}
      </DetailSection>

      {intake.submittedAt ? (
        <p className="text-xs text-slate-500">
          Intake submitted {formatMoveDate(intake.submittedAt.slice(0, 10))}
        </p>
      ) : null}
    </div>
  );
}
