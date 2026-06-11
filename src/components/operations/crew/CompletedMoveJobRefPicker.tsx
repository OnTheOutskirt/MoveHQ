"use client";

import { RelatedMoveMiniCard } from "@/components/operations/crew/RelatedMoveCell";
import { useMoves } from "@/components/moves/MovesProvider";
import { formatMoveDate, moveRouteLabel } from "@/lib/moves/format";
import { searchCompletedMoves } from "@/lib/moves/completed-moves";
import { resolveRelatedMove } from "@/lib/moves/resolve-related-move";
import { cn } from "@/lib/utils";
import { useEffect, useId, useMemo, useState } from "react";

export type CompletedMoveJobRefValue = {
  jobRef: string;
  moveId?: string;
};

type CompletedMoveJobRefPickerProps = {
  value: CompletedMoveJobRefValue;
  onChange: (value: CompletedMoveJobRefValue) => void;
  placeholder?: string;
  className?: string;
};

export function CompletedMoveJobRefPicker({
  value,
  onChange,
  placeholder = "Search moves by name, date, or address…",
  className,
}: CompletedMoveJobRefPickerProps) {
  const { moves } = useMoves();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value.jobRef);
  const listId = useId();

  useEffect(() => {
    setQuery(value.jobRef);
  }, [value.jobRef, value.moveId]);

  const matches = useMemo(
    () => searchCompletedMoves(moves, query),
    [moves, query],
  );

  const selectedMove = useMemo(
    () => resolveRelatedMove(moves, value),
    [moves, value],
  );

  function selectMove(move: (typeof moves)[number]) {
    setQuery(move.reference);
    onChange({ jobRef: move.reference, moveId: move.id });
    setOpen(false);
  }

  function handleInputChange(next: string) {
    setQuery(next);
    onChange({
      jobRef: next,
      moveId:
        selectedMove && next.trim().toLowerCase() === selectedMove.reference.toLowerCase()
          ? selectedMove.id
          : undefined,
    });
    setOpen(true);
  }

  function clearSelection() {
    setQuery("");
    onChange({ jobRef: "", moveId: undefined });
  }

  return (
    <div className={cn("relative space-y-2", className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">
              {query.trim()
                ? "No completed moves match that search."
                : "Search by customer name, move date, reference, or address."}
            </p>
          ) : (
            matches.map((move) => (
              <button
                key={move.id}
                type="button"
                role="option"
                aria-selected={value.moveId === move.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectMove(move)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-slate-50",
                  value.moveId === move.id && "bg-brand-50",
                )}
              >
                <span className="text-sm font-medium text-slate-900">{move.customerName}</span>
                <span className="text-[11px] text-slate-500">
                  {formatMoveDate(move.preferredDate)} · {move.reference}
                </span>
                <span className="truncate text-[10px] text-slate-400">
                  {moveRouteLabel(move.originAddress, move.destinationAddress)}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {selectedMove ? (
        <RelatedMoveMiniCard move={selectedMove} onClear={clearSelection} />
      ) : query.trim() ? (
        <p className="text-[11px] text-slate-500">Select a match to link the move record</p>
      ) : null}
    </div>
  );
}
