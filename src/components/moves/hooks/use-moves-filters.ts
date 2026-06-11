"use client";

import { useRepFilter } from "@/components/moves/hooks/use-rep-filter";
import { useMoves } from "@/components/moves/MovesProvider";
import { needsWebsiteBookingReview, resolveQuoteChannel } from "@/lib/moves/acquisition";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { QuoteChannel } from "@/lib/moves/types";
import {
  compareSalesPriority,
  getMovePriorityTier,
  PRIORITY_TIER_IDS,
  type PriorityTierId,
} from "@/lib/moves/move-priority-tier";
import { useMemo, useState } from "react";

export type QuoteChannelFilter = "all" | QuoteChannel | "web_review";
export type LeadScoreFilter = "all" | PriorityTierId | "unscored";

export type MovesFilters = ReturnType<typeof useMovesFilters>;

export function useMovesFilters() {
  const { moves } = useMoves();
  const activeMoves = useMemo(() => moves.filter((m) => !isMoveLost(m)), [moves]);
  const { repFilter, setRepFilter, reps, repFilteredMoves } = useRepFilter(activeMoves);
  const [quoteChannelFilter, setQuoteChannelFilter] = useState<QuoteChannelFilter>("all");
  const [leadScoreFilter, setLeadScoreFilter] = useState<LeadScoreFilter>("all");

  const filteredMoves = useMemo(() => {
    let list = repFilteredMoves;

    if (quoteChannelFilter === "web_review") {
      list = list.filter((m) => needsWebsiteBookingReview(m));
    } else if (quoteChannelFilter !== "all") {
      list = list.filter((m) => resolveQuoteChannel(m) === quoteChannelFilter);
    }

    if (leadScoreFilter !== "all") {
      list = list.filter((m) => {
        const tier = getMovePriorityTier(m);
        if (leadScoreFilter === "unscored") return tier == null;
        return tier === leadScoreFilter;
      });
    }

    return [...list].sort(compareSalesPriority);
  }, [repFilteredMoves, quoteChannelFilter, leadScoreFilter]);

  return {
    repFilter,
    setRepFilter,
    quoteChannelFilter,
    setQuoteChannelFilter,
    leadScoreFilter,
    setLeadScoreFilter,
    leadScoreOptions: PRIORITY_TIER_IDS,
    filteredMoves,
    reps,
  };
}
