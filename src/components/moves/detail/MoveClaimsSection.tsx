"use client";

import { ClaimsDetailSidebar } from "@/components/operations/claims/ClaimsDetailSidebar";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_STATUS_BADGE,
  CLAIM_STATUS_LABELS,
  claimsForMove,
  formatClaimMoney,
} from "@/lib/operations/claims";
import {
  checklistProgress,
  currentStepLabel,
  isWaitingOnVendor,
} from "@/lib/operations/claims-workflow";
import { claimVendorLabel } from "@/lib/operations/claims-vendors";
import type { MoveClaim } from "@/lib/operations/claims-types";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type PanelMode =
  | { type: "closed" }
  | { type: "view"; claimId: string }
  | { type: "add"; moveId?: string };

type MoveClaimsSectionProps = {
  move: MoveRecord;
};

export function MoveClaimsSection({ move }: MoveClaimsSectionProps) {
  const { claims } = useClaims();
  const { moves } = useMoves();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });

  const moveClaims = useMemo(
    () => claimsForMove(claims, move.id),
    [claims, move.id],
  );

  const openTotal = useMemo(
    () =>
      moveClaims
        .filter((c) => c.status !== "completed" && c.status !== "denied")
        .reduce((s, c) => s + c.amountClaimed, 0),
    [moveClaims],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            {moveClaims.length === 0
              ? "No claims filed for this move."
              : `${moveClaims.length} claim${moveClaims.length === 1 ? "" : "s"}${
                  openTotal > 0 ? ` · ${formatClaimMoney(openTotal)} open claimed` : ""
                }`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/operations/claims"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open claims workspace
          </Link>
          <Button type="button" size="sm" onClick={() => setPanel({ type: "add", moveId: move.id })}>
            <Plus className="h-4 w-4" />
            File claim
          </Button>
        </div>
      </div>

      {moveClaims.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {moveClaims.map((claim) => (
            <li key={claim.id}>
              <button
                type="button"
                onClick={() => setPanel({ type: "view", claimId: claim.id })}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
              >
                <ClaimRowSummary claim={claim} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ClaimsDetailSidebar mode={panel} moves={moves} onClose={() => setPanel({ type: "closed" })} />
    </>
  );
}

function ClaimRowSummary({ claim }: { claim: MoveClaim }) {
  const progress = checklistProgress(claim.checklist);
  const waiting = isWaitingOnVendor(claim);

  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900">{claim.reference}</span>
          <Badge className={CLAIM_STATUS_BADGE[claim.status]}>
            {CLAIM_STATUS_LABELS[claim.status]}
          </Badge>
          {waiting ? (
            <Badge className="bg-amber-100 text-amber-900">Waiting on vendor</Badge>
          ) : null}
          <span className="text-xs text-slate-500">{CLAIM_CATEGORY_LABELS[claim.category]}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-700">{claim.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Step: {currentStepLabel(claim)} · {progress.done}/{progress.total} complete
          {claim.vendorId ? ` · ${claimVendorLabel(claim.vendorId)}` : ""}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="font-medium tabular-nums text-slate-900">
          {formatClaimMoney(claim.amountClaimed)}
        </p>
        <p className="text-xs text-slate-500">{formatMoveDate(claim.reportedDate)}</p>
      </div>
    </>
  );
}
