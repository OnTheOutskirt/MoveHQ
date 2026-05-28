"use client";

import { useRepFilter } from "@/components/moves/hooks/use-rep-filter";
import { useMoves } from "@/components/moves/MovesProvider";
import { needsWebsiteBookingReview, resolveQuoteChannel } from "@/lib/moves/acquisition";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { QuoteChannel } from "@/lib/moves/types";
import { compareSalesPriority } from "@/lib/moves/move-priority-tier";
import { useMemo, useState } from "react";

export type QuoteChannelFilter = "all" | QuoteChannel | "web_review";

export type MovesFilters = ReturnType<typeof useMovesFilters>;

export function useMovesFilters() {
  const { moves } = useMoves();
  const activeMoves = useMemo(() => moves.filter((m) => !isMoveLost(m)), [moves]);
  const { repFilter, setRepFilter, reps, repFilteredMoves } = useRepFilter(activeMoves);
  const [quoteChannelFilter, setQuoteChannelFilter] = useState<QuoteChannelFilter>("all");

  const filteredMoves = useMemo(() => {
    let list = repFilteredMoves;

    if (quoteChannelFilter === "web_review") {
      list = list.filter((m) => needsWebsiteBookingReview(m));
    } else if (quoteChannelFilter !== "all") {
      list = list.filter((m) => resolveQuoteChannel(m) === quoteChannelFilter);
    }

    return [...list].sort(compareSalesPriority);
  }, [repFilteredMoves, quoteChannelFilter]);

  return {
    repFilter,
    setRepFilter,
    quoteChannelFilter,
    setQuoteChannelFilter,
    filteredMoves,
    reps,
  };
}
