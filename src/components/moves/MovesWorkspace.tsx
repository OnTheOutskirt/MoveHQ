"use client";

import { MoveListView } from "@/components/moves/MoveListView";
import { MovePipelineBoard } from "@/components/moves/MovePipelineBoard";
import { useMoves } from "@/components/moves/MovesProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { useMovesFilters } from "@/components/moves/hooks/use-moves-filters";
import { MovesToolbar } from "@/components/moves/shared/MovesToolbar";
import type { MovesViewMode } from "@/lib/moves/view-mode";
import { pageMeta } from "@/lib/navigation/page-meta";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus } from "lucide-react";
import { useState } from "react";

const meta = pageMeta["/sales/moves"];

export function MovesWorkspace() {
  const { updateMovePipelineStage, openNewMoveDialog } = useMoves();
  const { isAllLocationsView, hasMultipleLocations, activeLocation, config } = useWorkspace();
  const filters = useMovesFilters();
  const { filteredMoves, repFilter, quoteChannelFilter } = filters;
  const [view, setView] = useState<MovesViewMode>("pipeline");

  const isEmpty = filteredMoves.length === 0;

  const locationHint = hasMultipleLocations
    ? isAllLocationsView
      ? "All locations"
      : activeLocation?.name ?? config.company.name
    : activeLocation?.name ?? config.locations[0]?.name ?? config.company.name;

  return (
    <div className="space-y-4">
      <PageHeader
        title={meta.title}
        description={`${locationHint} · Pipeline board and list — filter by salesperson and quote source.`}
        actions={
          <Button type="button" size="sm" onClick={openNewMoveDialog}>
            <Plus className="h-4 w-4" />
            New move
          </Button>
        }
      />

      <MovesToolbar filters={filters} view={view} onViewChange={setView} />

      <div className="min-w-0">
        {isEmpty ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            {repFilter !== "all" && quoteChannelFilter !== "all"
              ? "No moves match these filters."
              : repFilter !== "all"
                ? "No moves for this salesperson."
                : quoteChannelFilter !== "all"
                  ? "No moves match this quote source."
                  : "No moves in the pipeline."}
          </p>
        ) : view === "pipeline" ? (
          <MovePipelineBoard moves={filteredMoves} onStageChange={updateMovePipelineStage} />
        ) : (
          <MoveListView moves={filteredMoves} />
        )}
      </div>
    </div>
  );
}
