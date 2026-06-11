import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import type { DefaultsSettings, FlatRateInventoryBasis } from "@/lib/settings/types";

/** Household goods average — used when deriving weight from cubic feet. */
export const LBS_PER_CUBIC_FOOT = 7;

export type InventoryVolumeEstimate = {
  basis: FlatRateInventoryBasis;
  cubicFeet: number;
  weightLbs: number;
};

export function resolveFlatRateInventoryBasis(
  defaults: DefaultsSettings,
  intake?: FlatRateIntake,
): FlatRateInventoryBasis {
  if (intake?.flatRateInventoryBasis === "cubic_feet" || intake?.flatRateInventoryBasis === "weight") {
    return intake.flatRateInventoryBasis;
  }
  return defaults.flatRateInventoryBasis;
}

/** Demo cubic-feet estimate from intake scope signals. */
export function estimateCubicFeetFromIntake(intake: FlatRateIntake): number {
  let cf = 0;

  const boxes = intake.estimatedBoxCount ?? 0;
  cf += boxes * 3;

  cf += intake.rooms.length * 95;

  const size = intake.homeSizeLabel.toLowerCase();
  if (size.includes("5") || size.includes("6+")) cf += 520;
  else if (size.includes("4")) cf += 380;
  else if (size.includes("3")) cf += 240;
  else if (size.includes("2")) cf += 160;
  else if (size.includes("1") || size.includes("studio")) cf += 90;

  if (intake.packingService === "full") cf += 140;
  else if (intake.packingService === "partial") cf += 60;

  const wardrobeUnits =
    intake.wardrobe.jonahCount + intake.wardrobe.clientOwnedCount;
  cf += wardrobeUnits * 16;

  if (intake.appliances.length > 0) cf += intake.appliances.length * 35;
  if (intake.hasSpecialtyItems) cf += 80;
  if (intake.hasJunk) cf += 45;

  return Math.max(50, Math.round(cf));
}

export function estimateWeightFromCubicFeet(cubicFeet: number): number {
  return Math.round(cubicFeet * LBS_PER_CUBIC_FOOT);
}

export function estimateInventoryVolume(
  intake: FlatRateIntake,
  basis: FlatRateInventoryBasis,
): InventoryVolumeEstimate {
  const cubicFeet = estimateCubicFeetFromIntake(intake);
  const weightLbs = estimateWeightFromCubicFeet(cubicFeet);
  return { basis, cubicFeet, weightLbs };
}

export function inventoryVolumeForMove(
  move: MoveRecord,
  defaults: DefaultsSettings,
): InventoryVolumeEstimate {
  const basis = resolveFlatRateInventoryBasis(defaults, move.intake);
  return estimateInventoryVolume(move.intake, basis);
}

export function formatInventoryBasisLabel(basis: FlatRateInventoryBasis): string {
  return basis === "weight" ? "Weight" : "Cubic feet";
}

export function formatInventoryVolumeDisplay(volume: InventoryVolumeEstimate): string {
  if (volume.basis === "weight") {
    return `${volume.weightLbs.toLocaleString("en-US")} lbs`;
  }
  return `${volume.cubicFeet.toLocaleString("en-US")} cu ft`;
}

export function formatInventoryVolumeDetail(volume: InventoryVolumeEstimate): string {
  const primary = formatInventoryVolumeDisplay(volume);
  const secondary =
    volume.basis === "weight"
      ? `~${volume.cubicFeet.toLocaleString("en-US")} cu ft equivalent`
      : `~${volume.weightLbs.toLocaleString("en-US")} lbs equivalent`;
  return `${primary} · ${secondary}`;
}
