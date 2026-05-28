"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { compareSalesPriority } from "@/lib/moves/move-priority-tier";
import { useMemo, useState } from "react";

export type MovesFilters = ReturnType<typeof useMovesFilters>;

export function useMovesFilters() {
  const { moves } = useMoves();
  const [repFilter, setRepFilter] = useState("all");

  const reps = useMemo(
    () => [...new Set(moves.map((m) => m.assignedRep))].sort(),
    [moves],
  );

  const filteredMoves = useMemo(() => {
    const byRep =
      repFilter === "all" ? moves : moves.filter((m) => m.assignedRep === repFilter);
    return [...byRep].sort(compareSalesPriority);
  }, [moves, repFilter]);

  return {
    repFilter,
    setRepFilter,
    filteredMoves,
    reps,
  };
}
