import { personKindLabel } from "@/lib/people/display";
import { getPersonById, MOCK_PEOPLE } from "@/lib/people/mock-data";
import { getStoredPersonById, listAllPeople } from "@/lib/people/people-storage";
import { linkedPersonRoleLabel, primaryCustomer } from "@/lib/moves/linked-people";
import type { MoveRecord } from "./types";
import type { PersonRecord } from "@/lib/people/types";

export function moveHasShipper(move: MoveRecord): boolean {
  if (move.contactId.trim()) return true;
  if (move.customerName.trim()) return true;
  return Boolean(primaryCustomer(move.linkedPeople));
}

/** Shipper / household name for this move (top-level field or linked primary customer). */
export function moveShipperName(move: MoveRecord): string {
  const fromMove = move.customerName.trim();
  if (fromMove) return fromMove;
  const linked = primaryCustomer(move.linkedPeople);
  return linked?.name.trim() ?? "";
}

/** Move detail title — shipper name plus "Move", e.g. "Sarah & Tom Walsh Move". */
export function moveDisplayTitle(move: MoveRecord): string {
  const shipper = moveShipperName(move);
  return shipper ? `${shipper} Move` : "Move";
}

export function getMoveContactPerson(move: MoveRecord): PersonRecord | undefined {
  if (move.contactId) {
    const byId = getStoredPersonById(move.contactId) ?? getPersonById(move.contactId);
    if (byId) return byId;
  }
  if (typeof window !== "undefined") {
    return listAllPeople().find((p) => p.moveIds.includes(move.id));
  }
  return MOCK_PEOPLE.find((p) => p.moveIds.includes(move.id));
}

/** Display label under the primary name on the move detail People card. */
export function primaryMovePersonRoleLabel(move: MoveRecord): string {
  const linked = primaryCustomer(move.linkedPeople);
  if (linked) return linkedPersonRoleLabel(linked.role);

  const person = getMoveContactPerson(move);
  if (person) return personKindLabel(person.kind);

  if (
    move.pipelineStage === "booked" ||
    move.pipelineStage === "completed" ||
    move.status === "booked" ||
    move.status === "completed"
  ) {
    return "Customer";
  }
  return "Lead";
}
