"use client";

import { LocationBadge } from "@/components/workspace/LocationBadge";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { QuadrantBadge } from "@/components/moves/shared/QuadrantBadge";
import { getNextOpenFollowUp } from "@/lib/moves/move-follow-ups";
import { DataTable, type Column, type SortDirection } from "@/components/ui/DataTable";
import { formatMoveDate, formatQuote, moveRouteLabel } from "@/lib/moves/format";
import { getFollowUpBucket } from "@/lib/moves/follow-ups";
import { getNextAction } from "@/lib/moves/move-workspace";
import {
  isFollowUpOverdue,
  isMoveLost,
  moveStageDisplayLabel,
  pipelineStageConfig,
  pipelineStageIndex,
} from "@/lib/moves/move-pipeline";
import { quoteSourceGroupLabel } from "@/lib/moves/acquisition";
import {
  compareSalesPriority,
  getMoveEstimatedValue,
  leadChannelLabel,
  priorityTierSortOrder,
  getMovePriorityTier,
} from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { useRouter } from "next/navigation";
import { salesMovePath } from "@/lib/navigation/routes";
import { useCallback, useMemo, useState } from "react";

type MoveListViewProps = {
  moves: MoveRecord[];
};

type SortKey =
  | "customer"
  | "location"
  | "quadrant"
  | "pipeline"
  | "route"
  | "date"
  | "rep"
  | "quote"
  | "updated";

type SortState = { key: SortKey; direction: SortDirection };

function compareMoves(a: MoveRecord, b: MoveRecord, key: SortKey, direction: SortDirection): number {
  let cmp = 0;

  switch (key) {
    case "customer":
      cmp =
        a.customerName.localeCompare(b.customerName, undefined, { sensitivity: "base" }) ||
        a.reference.localeCompare(b.reference, undefined, { sensitivity: "base" });
      break;
    case "location":
      cmp = a.locationId.localeCompare(b.locationId);
      break;
    case "quadrant":
      cmp =
        priorityTierSortOrder(getMovePriorityTier(a)) -
        priorityTierSortOrder(getMovePriorityTier(b));
      break;
    case "pipeline":
      cmp = pipelineStageIndex(a.pipelineStage) - pipelineStageIndex(b.pipelineStage);
      break;
    case "route":
      cmp = moveRouteLabel(a.originAddress, a.destinationAddress).localeCompare(
        moveRouteLabel(b.originAddress, b.destinationAddress),
        undefined,
        { sensitivity: "base" },
      );
      break;
    case "date":
      cmp = a.preferredDate.localeCompare(b.preferredDate);
      break;
    case "rep":
      cmp = a.assignedRep.localeCompare(b.assignedRep, undefined, { sensitivity: "base" });
      break;
    case "quote": {
      const aAmount = getMoveEstimatedValue(a) ?? Number.NEGATIVE_INFINITY;
      const bAmount = getMoveEstimatedValue(b) ?? Number.NEGATIVE_INFINITY;
      cmp = aAmount - bAmount;
      break;
    }
    case "updated":
      cmp = a.updatedAt.localeCompare(b.updatedAt);
      break;
  }

  return direction === "asc" ? cmp : -cmp;
}

function isSortKey(key: string): key is SortKey {
  return (
    key === "customer" ||
    key === "location" ||
    key === "quadrant" ||
    key === "pipeline" ||
    key === "route" ||
    key === "date" ||
    key === "rep" ||
    key === "quote" ||
    key === "updated"
  );
}

export function MoveListView({ moves }: MoveListViewProps) {
  const router = useRouter();
  const { hasMultipleLocations } = useWorkspace();
  const [sort, setSort] = useState<SortState | null>(null);

  const handleSortColumn = useCallback((key: string) => {
    if (!isSortKey(key)) return;
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }, []);

  const sortedMoves = useMemo(() => {
    const copy = [...moves];
    if (!sort) return copy.sort(compareSalesPriority);
    return copy.sort((a, b) => compareMoves(a, b, sort.key, sort.direction));
  }, [moves, sort]);

  const columns = useMemo<Column<MoveRecord>[]>(() => {
    const cols: Column<MoveRecord>[] = [
      {
        key: "customer",
        header: "Customer",
        sortable: true,
        cell: (move) => (
          <div>
            <p className="font-medium text-slate-900">{move.customerName}</p>
            <p className="text-xs text-slate-400">{move.reference}</p>
          </div>
        ),
      },
    ];
    if (hasMultipleLocations) {
      cols.push({
        key: "location",
        header: "Location",
        sortable: true,
        cell: (move) => <LocationBadge locationId={move.locationId} />,
      });
    }
    cols.push(
      {
        key: "quadrant",
        header: "Q",
        sortable: true,
        cell: (move) => <QuadrantBadge move={move} />,
      },
      {
        key: "pipeline",
        header: "Pipeline",
        sortable: true,
        cell: (move) => {
          const cfg = pipelineStageConfig[move.pipelineStage];
          return (
            <div className="space-y-1">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${isMoveLost(move) ? "bg-red-50 text-red-800" : cfg.badge}`}
              >
                {moveStageDisplayLabel(move)}
              </span>
              {getNextOpenFollowUp(move) && move.conditionStatus !== "lost" ? (
                <p
                  className={`text-[10px] font-medium ${isFollowUpOverdue(move) ? "text-amber-800" : "text-slate-500"}`}
                >
                  F/U {formatMoveDate(getNextOpenFollowUp(move)!.dueAt.slice(0, 10))}
                  {getFollowUpBucket(move) === "overdue" ? " · overdue" : ""}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "route",
        header: "Route / source",
        sortable: true,
        cell: (move) => (
          <div className="text-sm">
            <p className="text-slate-600">
              {moveRouteLabel(move.originAddress, move.destinationAddress)}
            </p>
            <p className="text-xs text-slate-500">
              {quoteSourceGroupLabel(move)}
              <span className="text-slate-300"> · </span>
              {leadChannelLabel(move.leadChannel)}
            </p>
          </div>
        ),
      },
      {
        key: "quote",
        header: "Value",
        sortable: true,
        cell: (move) => (
          <span className="font-medium tabular-nums">
            {formatQuote(getMoveEstimatedValue(move), move.quoteType)}
          </span>
        ),
      },
      {
        key: "date",
        header: "Move date",
        sortable: true,
        cell: (move) => formatMoveDate(move.preferredDate),
      },
      {
        key: "rep",
        header: "Rep",
        sortable: true,
        cell: (move) => (
          <div>
            <p>{move.assignedRep}</p>
            <p className="text-xs text-slate-500">{getNextAction(move).label}</p>
          </div>
        ),
      },
    );
    return cols;
  }, [hasMultipleLocations]);

  return (
    <DataTable
      columns={columns}
      data={sortedMoves}
      sortKey={sort?.key}
      sortDirection={sort?.direction ?? null}
      onSortColumn={handleSortColumn}
      onRowClick={(move) => router.push(salesMovePath(move.id))}
      getRowKey={(move) => move.id}
      emptyMessage="No moves match your filters."
    />
  );
}
