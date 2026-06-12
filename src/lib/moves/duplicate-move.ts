import { relabelJobDaysByDate } from "@/lib/moves/job-day-form";
import type { MoveRecord } from "@/lib/moves/types";

function nextReference(existing: MoveRecord[]): string {
  const used = new Set(existing.map((m) => m.reference));
  for (let n = existing.length + 1; n < existing.length + 10_000; n += 1) {
    const ref = `MV-${String(n).padStart(4, "0")}`;
    if (!used.has(ref)) return ref;
  }
  return `MV-${Date.now().toString(36).toUpperCase()}`;
}

function newMoveId(): string {
  return `mv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Copy scope, customer, intake, and job-day plan into a fresh pipeline lead. */
export function duplicateMoveRecord(
  source: MoveRecord,
  existingMoves: MoveRecord[],
  actorName: string,
): MoveRecord {
  const now = new Date().toISOString();
  const id = newMoveId();
  const reference = nextReference(existingMoves);

  const jobDays = relabelJobDaysByDate(
    source.jobDays.map((day, index) => ({
      ...day,
      id: `${id}-jd-${index + 1}`,
      status: "proposed" as const,
    })),
  );

  const linkedPeople = source.linkedPeople.map((person, index) => ({
    ...person,
    id: `${id}-lp-${index + 1}`,
  }));

  return {
    ...source,
    id,
    reference,
    pipelineStage: "new_lead",
    waitingSubstage: null,
    conditionStatus: "active",
    bookingReviewStatus: "not_required",
    lostAt: null,
    lostFromStage: null,
    lostReason: null,
    lostQualification: null,
    lostReasonId: null,
    lostNotes: null,
    status: "new_request",
    sentQuote: null,
    sentContract: null,
    followUpDue: null,
    followUps: [],
    scheduledWalkthrough: null,
    crewFeedback: null,
    createdAt: now,
    updatedAt: now,
    jobDays,
    linkedPeople,
    intake: { ...source.intake },
    activities: [
      {
        id: `activity-${id}-dup`,
        type: "note",
        at: now,
        summary: `Duplicated from ${source.reference} — ${source.customerName}`,
        actor: actorName,
      },
    ],
  };
}
