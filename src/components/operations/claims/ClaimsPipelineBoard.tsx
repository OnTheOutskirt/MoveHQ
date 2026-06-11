"use client";

import { Badge } from "@/components/ui/Badge";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_PIPELINE_COLUMN_CLASS,
  CLAIM_PIPELINE_LABELS,
  claimsForPipelineColumn,
  currentStepLabel,
  formatClaimMoney,
} from "@/lib/operations/claims";
import { checklistProgress, isWaitingOnVendor } from "@/lib/operations/claims-workflow";
import {
  CLAIM_PIPELINE_COLUMNS,
  type MoveClaim,
} from "@/lib/operations/claims-types";
import { claimVendorLabel } from "@/lib/operations/claims-vendors";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type ClaimsPipelineBoardProps = {
  claims: MoveClaim[];
  onClaimClick: (claimId: string) => void;
};

function PipelineColumn({
  column,
  claims,
  onClaimClick,
}: {
  column: (typeof CLAIM_PIPELINE_COLUMNS)[number];
  claims: MoveClaim[];
  onClaimClick: (claimId: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] min-w-[8.5rem] flex-col rounded-lg border",
        CLAIM_PIPELINE_COLUMN_CLASS[column],
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-inherit px-2 py-2">
        <span className="truncate text-[11px] font-semibold text-slate-800">
          {CLAIM_PIPELINE_LABELS[column]}
        </span>
        <span className="shrink-0 rounded-full bg-white/80 px-1.5 py-px text-[10px] font-semibold text-slate-600">
          {claims.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-1.5">
        {claims.length === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-200/80 px-2 py-8 text-center text-[10px] text-slate-400">
            Empty
          </p>
        ) : (
          claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onClick={() => onClaimClick(claim.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function ClaimCard({ claim, onClick }: { claim: MoveClaim; onClick: () => void }) {
  const progress = checklistProgress(claim.checklist);
  const waiting = isWaitingOnVendor(claim);
  const step = currentStepLabel(claim);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border border-slate-200 bg-white p-2 text-left shadow-sm transition-shadow hover:shadow"
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-slate-900">{claim.reference}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-600">{claim.title}</p>
      </div>
      <div className="mt-1.5">
        <Badge className="px-1 py-0 text-[9px] bg-brand-50 text-brand-800">{step}</Badge>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <span className="text-[9px] text-slate-500">{CLAIM_CATEGORY_LABELS[claim.category]}</span>
        {waiting ? (
          <Badge className="px-1 py-0 text-[9px] bg-amber-100 text-amber-900">Vendor</Badge>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-1 text-[9px] text-slate-500">
        <span className="truncate">{claim.customerName}</span>
        <span className="shrink-0 tabular-nums font-medium text-slate-700">
          {formatClaimMoney(claim.amountClaimed)}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${progress.pct}%` }}
        />
      </div>
      {claim.vendorId && waiting ? (
        <p className="mt-1 truncate text-[9px] text-amber-800">
          {claimVendorLabel(claim.vendorId)}
        </p>
      ) : null}
    </button>
  );
}

export function ClaimsPipelineBoard({ claims, onClaimClick }: ClaimsPipelineBoardProps) {
  const openClaims = useMemo(
    () => claims.filter((c) => c.status !== "completed" && c.status !== "denied"),
    [claims],
  );

  const claimsByColumn = useMemo(() => {
    const map = new Map<(typeof CLAIM_PIPELINE_COLUMNS)[number], MoveClaim[]>();
    for (const col of CLAIM_PIPELINE_COLUMNS) {
      map.set(col, claimsForPipelineColumn(openClaims, col));
    }
    return map;
  }, [openClaims]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Pipeline columns update automatically from each claim&apos;s workflow progress. Open a claim
        to advance steps.
      </p>
      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[56rem] items-stretch gap-2"
          style={{
            gridTemplateColumns: `repeat(${CLAIM_PIPELINE_COLUMNS.length}, minmax(8.5rem, 1fr))`,
          }}
        >
          {CLAIM_PIPELINE_COLUMNS.map((column) => (
            <PipelineColumn
              key={column}
              column={column}
              claims={claimsByColumn.get(column) ?? []}
              onClaimClick={onClaimClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
