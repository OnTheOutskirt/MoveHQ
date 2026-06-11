import {
  equipmentMaterialsCost,
  normalizeEquipmentSupplies,
} from "@/lib/moves/equipment-supplies";
import {
  getMoveProfitabilityAnalysis,
  type JobDayProfitabilityRow,
  type MoveProfitabilityAnalysis,
} from "@/lib/moves/profitability";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { jobDayDriveDisplay } from "@/lib/operations/job-day-drive";

function estimateMaterialsCost(move: MoveRecord): number {
  const { intake } = move;
  let total = 0;
  if (intake.packingService === "full") total += 380;
  else if (intake.packingService === "partial") total += 195;

  const equipmentCost = equipmentMaterialsCost(normalizeEquipmentSupplies(intake), move);
  if (equipmentCost > 0) {
    total += equipmentCost;
  } else if (intake.wardrobe.jonahCount > 0) {
    total += intake.wardrobe.jonahCount * (intake.wardrobe.jonahType === "keep" ? 12 : 22);
  }

  if (intake.hasJunk) total += 85;
  if (intake.estimatedBoxCount != null && intake.estimatedBoxCount > 60) {
    total += 45;
  }
  return total;
}

export type OpsJobDayInfo = {
  analysis: MoveProfitabilityAnalysis;
  profitabilityRow: JobDayProfitabilityRow | null;
  crewPlanned: number;
  crewActual: number | null;
  materialsEstimated: number;
  driveEstimated: number;
  driveActual: number | null;
};

export function getOpsJobDayInfo(move: MoveRecord, jobDay: MoveJobDay): OpsJobDayInfo {
  const analysis = getMoveProfitabilityAnalysis(move);
  const profitabilityRow = analysis.byJobDay.find((r) => r.jobDayId === jobDay.id) ?? null;
  const dayCount = Math.max(1, move.jobDays.length);
  const drive = jobDayDriveDisplay(jobDay, move);

  return {
    analysis,
    profitabilityRow,
    crewPlanned: jobDay.crewSize ?? profitabilityRow?.crewSize ?? 3,
    crewActual: jobDay.crewSizeActual ?? null,
    materialsEstimated: Math.round(estimateMaterialsCost(move) / dayCount),
    driveEstimated: drive.estimated,
    driveActual: drive.actual,
  };
}
