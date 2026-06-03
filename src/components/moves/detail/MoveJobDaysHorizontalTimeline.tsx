"use client";

import { useState } from "react";
import { MoveJobDayEditorSidebar } from "@/components/moves/detail/MoveJobDayEditorSidebar";
import { MoveJobDayHorizontalCard } from "@/components/moves/detail/MoveJobDayHorizontalCard";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import { getSortedJobDays } from "@/lib/moves/job-day-form";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus } from "lucide-react";

export type MoveJobDayEditorState =
  | { open: false }
  | { open: true; dayId: string | null; duplicateFromDayId: string | null };

type MoveJobDaysHorizontalTimelineProps = {
  move: MoveRecord;
  editor?: MoveJobDayEditorState;
  onEditorChange?: (state: MoveJobDayEditorState) => void;
};

export function MoveJobDaysHorizontalTimeline({
  move,
  editor: controlledEditor,
  onEditorChange,
}: MoveJobDaysHorizontalTimelineProps) {
  const [internalEditor, setInternalEditor] = useState<MoveJobDayEditorState>({ open: false });
  const editor = controlledEditor ?? internalEditor;
  const setEditor = onEditorChange ?? setInternalEditor;
  const days = getSortedJobDays(move);
  const moveDate = move.intake.moveDate || move.preferredDate;

  function openCreate() {
    setEditor({ open: true, dayId: null, duplicateFromDayId: null });
  }

  function openEdit(dayId: string) {
    setEditor({ open: true, dayId, duplicateFromDayId: null });
  }

  function openDuplicate(sourceDayId: string) {
    setEditor({ open: true, dayId: null, duplicateFromDayId: sourceDayId });
  }

  function closeEditor() {
    setEditor({ open: false });
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Job days</h2>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add day
          </Button>
        </div>

        {days.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-900">No job days yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Add packing, load, and delivery days — start from{" "}
              {moveDate ? formatMoveDate(moveDate) : "the move date"}.
            </p>
            <Button type="button" size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add first day
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto px-4 py-4">
            <div className="flex gap-3">
              {days.map((day, i) => (
                <MoveJobDayHorizontalCard
                  key={day.id}
                  move={move}
                  day={day}
                  index={i}
                  onEdit={() => openEdit(day.id)}
                  onDuplicate={() => openDuplicate(day.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <MoveJobDayEditorSidebar
        move={move}
        dayId={editor.open ? editor.dayId : null}
        duplicateFromDayId={editor.open ? editor.duplicateFromDayId : null}
        open={editor.open}
        onClose={closeEditor}
      />
    </>
  );
}
