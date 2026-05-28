"use client";

import type { MoveRecord } from "@/lib/moves/types";
import { useMemo, useState } from "react";

export function useRepFilter(moves: MoveRecord[]) {
  const [repFilter, setRepFilter] = useState("all");

  const reps = useMemo(
    () => [...new Set(moves.map((m) => m.assignedRep))].sort(),
    [moves],
  );

  const repFilteredMoves = useMemo(() => {
    if (repFilter === "all") return moves;
    return moves.filter((m) => m.assignedRep === repFilter);
  }, [moves, repFilter]);

  return {
    repFilter,
    setRepFilter,
    reps,
    repFilteredMoves,
  };
}
