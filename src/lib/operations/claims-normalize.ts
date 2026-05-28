import type { MoveClaim } from "./claims-types";

/** Backfill fields when loading older localStorage rows. */
export function normalizeClaim(claim: MoveClaim): MoveClaim {
  return {
    ...claim,
    amountClaimed: Number(claim.amountClaimed) || 0,
    amountReserved: Number(claim.amountReserved) || 0,
    amountPaid: Number(claim.amountPaid) || 0,
  };
}
