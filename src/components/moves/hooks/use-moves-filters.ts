"use client";

import { useRepFilter } from "@/components/moves/hooks/use-rep-filter";
import { useMoves } from "@/components/moves/MovesProvider";
import {
  matchesQuoteSourceFilter,
  matchesQuoteTypeFilter,
  type QuoteSourceFilter,
  type QuoteTypeFilter,
} from "@/lib/moves/acquisition";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import {
  compareSalesPriority,
  getMovePriorityTier,
  PRIORITY_TIER_IDS,
  type PriorityTierId,
} from "@/lib/moves/move-priority-tier";
import { useMemo, useState } from "react";

export type LeadScoreFilter = "all" | PriorityTierId | "unscored";

export type MovesFilters = ReturnType<typeof useMovesFilters>;

export function useMovesFilters() {
  const { moves } = useMoves();
  const activeMoves = useMemo(() => moves.filter((m) => !isMoveLost(m)), [moves]);
  const { repFilter, setRepFilter, reps, repFilteredMoves } = useRepFilter(activeMoves);
  const [quoteSourceFilter, setQuoteSourceFilter] = useState<QuoteSourceFilter>("all");
  const [quoteTypeFilter, setQuoteTypeFilter] = useState<QuoteTypeFilter>("all");
  const [leadScoreFilter, setLeadScoreFilter] = useState<LeadScoreFilter>("all");

  const filteredMoves = useMemo(() => {
    let list = repFilteredMoves;

    if (quoteSourceFilter !== "all") {
      list = list.filter((m) => matchesQuoteSourceFilter(quoteSourceFilter, m));
    }

    if (quoteTypeFilter !== "all") {
      list = list.filter((m) => matchesQuoteTypeFilter(quoteTypeFilter, m));
    }

    if (leadScoreFilter !== "all") {
      list = list.filter((m) => {
        const tier = getMovePriorityTier(m);
        if (leadScoreFilter === "unscored") return tier == null;
        return tier === leadScoreFilter;
      });
    }

    return [...list].sort(compareSalesPriority);
  }, [repFilteredMoves, quoteSourceFilter, quoteTypeFilter, leadScoreFilter]);

  const hasActiveFilters =
    quoteSourceFilter !== "all" || quoteTypeFilter !== "all" || leadScoreFilter !== "all";

  return {
    repFilter,
    setRepFilter,
    quoteSourceFilter,
    setQuoteSourceFilter,
    quoteTypeFilter,
    setQuoteTypeFilter,
    leadScoreFilter,
    setLeadScoreFilter,
    leadScoreOptions: PRIORITY_TIER_IDS,
    filteredMoves,
    reps,
    hasActiveFilters,
  };
}
