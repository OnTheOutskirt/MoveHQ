import { formatIntakeAddress } from "@/lib/moves/intake-display";
import type { FlatRateIntake, IntakeAddress } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";

export function addressToMoveSummary(addr: IntakeAddress): string {
  const formatted = formatIntakeAddress(addr);
  return formatted === "—" ? "" : formatted;
}

/** Keep top-level move fields in sync when intake is edited on Move Plan. */
export function applyIntakeToMove(move: MoveRecord, intake: FlatRateIntake): MoveRecord {
  return {
    ...move,
    intake,
    customerName: intake.clientName.trim() || move.customerName,
    customerPhone: intake.clientPhone.trim() || move.customerPhone,
    customerEmail: intake.clientEmail.trim() || move.customerEmail,
    preferredDate: intake.moveDate || move.preferredDate,
    originAddress: addressToMoveSummary(intake.origin) || move.originAddress,
    destinationAddress: addressToMoveSummary(intake.destination) || move.destinationAddress,
    updatedAt: new Date().toISOString(),
  };
}
