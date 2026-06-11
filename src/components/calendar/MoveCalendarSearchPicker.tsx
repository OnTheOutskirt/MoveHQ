"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { searchMovesForCalendar } from "@/lib/calendar/search-moves";
import type { MoveRecord } from "@/lib/moves/types";
import { formatMoveDate, moveRouteLabel } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { useEffect, useId, useMemo, useState } from "react";

type MoveSearchFn = (moves: MoveRecord[], query: string) => MoveRecord[];

type MoveCalendarSearchPickerProps = {
  selectedMoveId?: string;
  onSelect: (move: MoveRecord) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  searchFn?: MoveSearchFn;
  emptyQueryHint?: string;
};

export function MoveCalendarSearchPicker({
  selectedMoveId,
  onSelect,
  onClear,
  placeholder = "Search moves by name, date, or address…",
  className,
  searchFn = searchMovesForCalendar,
  emptyQueryHint = "Search by customer name, move date, reference, or address.",
}: MoveCalendarSearchPickerProps) {
  const { moves } = useMoves();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listId = useId();

  const selectedMove = useMemo(
    () => (selectedMoveId ? moves.find((m) => m.id === selectedMoveId) : undefined),
    [moves, selectedMoveId],
  );

  useEffect(() => {
    if (selectedMove) setQuery(selectedMove.customerName);
  }, [selectedMove?.id, selectedMove?.customerName]);

  const matches = useMemo(() => searchFn(moves, query), [moves, query, searchFn]);

  function selectMove(move: MoveRecord) {
    setQuery(move.customerName);
    onSelect(move);
    setOpen(false);
  }

  function clearSelection() {
    setQuery("");
    onClear?.();
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                ? "No moves match that search."
                : emptyQueryHint}
            </p>
          ) : (
            matches.map((move) => (
              <button
                key={move.id}
                type="button"
                role="option"
                aria-selected={selectedMoveId === move.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectMove(move)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-slate-50",
                  selectedMoveId === move.id && "bg-brand-50",
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
        <div className="mt-2 flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{selectedMove.customerName}</p>
            <p className="text-[11px] text-slate-500">
              {formatMoveDate(selectedMove.preferredDate)} · {selectedMove.reference}
            </p>
          </div>
          {onClear ? (
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : query.trim() ? (
        <p className="mt-1 text-[11px] text-slate-500">Select a move from the list</p>
      ) : null}
    </div>
  );
}
