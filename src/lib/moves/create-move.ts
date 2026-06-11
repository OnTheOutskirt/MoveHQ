import { enrichMockMove } from "@/lib/moves/mock-extras";
import { REAL_ADMIN_PERSONA } from "@/lib/session/personas";
import { DEFAULT_COMPANY_ID } from "@/lib/workspace/constants";
import type { PersonRecord } from "@/lib/people/types";
import type { MoveRecord } from "@/lib/moves/types";

function nextReference(existing: MoveRecord[]): string {
  const used = new Set(existing.map((m) => m.reference));
  for (let n = existing.length + 1; n < existing.length + 10_000; n += 1) {
    const ref = `MV-${String(n).padStart(4, "0")}`;
    if (!used.has(ref)) return ref;
  }
  return `MV-${Date.now().toString(36).toUpperCase()}`;
}

export function buildNewMoveFromPerson(
  person: PersonRecord,
  existingMoves: MoveRecord[],
  scope: { companyId: string; locationId: string },
  actor: { name: string; assignedRep: string } = {
    name: REAL_ADMIN_PERSONA.name,
    assignedRep: REAL_ADMIN_PERSONA.assignedRep,
  },
): MoveRecord {
  const now = new Date().toISOString();
  const id = `mv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return enrichMockMove({
    id,
    companyId: scope.companyId,
    locationId: scope.locationId,
    reference: nextReference(existingMoves),
    pipelineStage: "new_lead",
    waitingSubstage: null,
    conditionStatus: "active",
    bookingReviewStatus: "not_required",
    lostAt: null,
    lostFromStage: null,
    lostReason: null,
    leadChannel: "phone",
    quoteChannel: "office",
    intakeProgress: "started",
    websiteIntake: null,
    contactId: person.id,
    customerName: person.name,
    customerPhone: person.phone ?? "",
    customerEmail: person.email ?? "",
    status: "new_request",
    source: "Manual entry",
    assignedRep: actor.assignedRep,
    coordinator: null,
    moveType: "Local",
    originAddress: "",
    destinationAddress: "",
    preferredDate: "",
    quoteAmount: null,
    quoteType: null,
    bedrooms: null,
    createdAt: now,
    updatedAt: now,
    activities: [
      {
        id: `activity-${id}-created`,
        type: "note",
        at: now,
        summary: `New move created — ${person.name}`,
        actor: actor.name,
      },
    ],
  });
}
