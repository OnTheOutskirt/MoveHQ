"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { MoveCompactTile } from "@/components/moves/shared/MoveCompactTile";
import {
  isPipelineStage,
  MOVES_PIPELINE_BOARD_STAGES,
  pipelineStageConfig,
  pipelineStageLabel,
} from "@/lib/moves/move-pipeline";
import type { MoveRecord, PipelineStageId } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type MovePipelineBoardProps = {
  moves: MoveRecord[];
  onStageChange: (moveId: string, stage: PipelineStageId) => void;
};

const pipelineCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const columnPointerHits = pointerHits.filter((c) => isPipelineStage(String(c.id)));
  if (columnPointerHits.length > 0) return columnPointerHits;

  const rectHits = rectIntersection(args);
  const columnRectHits = rectHits.filter((c) => isPipelineStage(String(c.id)));
  if (columnRectHits.length > 0) return columnRectHits;

  return pointerHits.length > 0 ? pointerHits : rectHits;
};

function resolveTargetStage(
  over: DragEndEvent["over"] | DragOverEvent["over"],
  moves: MoveRecord[],
): PipelineStageId | null {
  if (!over) return null;
  const overId = String(over.id);

  if (isPipelineStage(overId)) return overId;

  const overMove = moves.find((m) => m.id === overId);
  if (overMove) return overMove.pipelineStage;

  const columnStage = (over.data.current as { pipelineStage?: PipelineStageId } | undefined)
    ?.pipelineStage;
  if (columnStage && isPipelineStage(columnStage)) return columnStage;

  return null;
}

function PipelineColumn({
  stage,
  moves,
  activeMoveId,
  isDropTarget,
}: {
  stage: PipelineStageId;
  moves: MoveRecord[];
  activeMoveId: string | null;
  isDropTarget: boolean;
}) {
  const config = pipelineStageConfig[stage];
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", pipelineStage: stage },
  });

  const highlight = isOver || isDropTarget;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[10rem] min-w-[7.5rem] flex-col rounded-lg border transition-colors duration-200",
        config.column,
        highlight && "border-brand-400 bg-brand-50/40 ring-2 ring-inset ring-brand-400/40",
      )}
    >
      <div className="flex shrink-0 flex-col gap-0.5 border-b border-inherit px-2 py-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
            <span className="truncate text-[11px] font-semibold text-slate-800">
              {pipelineStageLabel(stage)}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-white/80 px-1.5 py-px text-[10px] font-semibold text-slate-600">
            {moves.length}
          </span>
        </div>
        <p className="line-clamp-2 text-[9px] leading-snug text-slate-500">{config.description}</p>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 p-1.5 transition-colors",
          highlight && "bg-brand-50/20",
        )}
      >
        {moves.length === 0 ? (
          <p
            className={cn(
              "flex flex-1 items-center justify-center rounded-md border border-dashed px-2 py-8 text-center text-[10px]",
              highlight ? "border-brand-300 text-brand-700" : "border-slate-200/80 text-slate-400",
            )}
          >
            {highlight ? "Drop here" : "Empty"}
          </p>
        ) : (
          moves.map((move) => (
            <DraggableMoveCard key={move.id} move={move} isGhost={activeMoveId === move.id} />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableMoveCard({ move, isGhost }: { move: MoveRecord; isGhost: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: move.id,
    data: { type: "move", pipelineStage: move.pipelineStage },
  });

  return (
    <div ref={setNodeRef} className={cn(isDragging && "touch-none")}>
      <MoveCompactTile
        move={move}
        isDragging={isGhost || isDragging}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

export function MovePipelineBoard({
  moves,
  onStageChange,
}: MovePipelineBoardProps) {
  const [activeMoveId, setActiveMoveId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStageId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const boardMoves = useMemo(
    () => moves.filter((m) => m.pipelineStage !== "completed"),
    [moves],
  );

  const movesByStage = useMemo(() => {
    const map = new Map<PipelineStageId, MoveRecord[]>();
    for (const stage of MOVES_PIPELINE_BOARD_STAGES) {
      map.set(stage, []);
    }
    for (const move of boardMoves) {
      const list = map.get(move.pipelineStage);
      if (list) list.push(move);
    }
    return map;
  }, [boardMoves]);

  const activeMove = activeMoveId ? boardMoves.find((m) => m.id === activeMoveId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pipelineCollisionDetection}
      onDragStart={(e) => setActiveMoveId(String(e.active.id))}
      onDragOver={(e) => setOverStage(resolveTargetStage(e.over, boardMoves))}
      onDragEnd={(e) => {
        setActiveMoveId(null);
        setOverStage(null);
        const moveId = String(e.active.id);
        const next = resolveTargetStage(e.over, boardMoves);
        if (!next || next === "completed") return;
        const move = boardMoves.find((m) => m.id === moveId);
        if (!move || move.pipelineStage === next) return;
        onStageChange(moveId, next);
      }}
      onDragCancel={() => {
        setActiveMoveId(null);
        setOverStage(null);
      }}
    >
      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[52rem] items-stretch gap-2"
          style={{
            gridTemplateColumns: `repeat(${MOVES_PIPELINE_BOARD_STAGES.length}, minmax(7.5rem, 1fr))`,
          }}
        >
          {MOVES_PIPELINE_BOARD_STAGES.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              moves={movesByStage.get(stage) ?? []}
              activeMoveId={activeMoveId}
              isDropTarget={overStage === stage}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
        {activeMove ? (
          <div className="w-52 max-w-[calc(100vw-2rem)] cursor-grabbing shadow-lg">
            <MoveCompactTile move={activeMove} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
