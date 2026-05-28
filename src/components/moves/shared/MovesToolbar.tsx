"use client";

import type { MovesFilters } from "@/components/moves/hooks/use-moves-filters";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import type { MovesViewMode } from "@/lib/moves/view-mode";
import { LayoutGrid, List } from "lucide-react";

const MOVES_VIEW_OPTIONS = [
  { id: "pipeline" as const, label: "Pipeline", icon: LayoutGrid },
  { id: "list" as const, label: "List", icon: List },
];

type MovesToolbarProps = {
  filters: MovesFilters;
  view: MovesViewMode;
  onViewChange: (view: MovesViewMode) => void;
};

export function MovesToolbar({ filters, view, onViewChange }: MovesToolbarProps) {
  const { repFilter, setRepFilter, quoteChannelFilter, setQuoteChannelFilter, reps } = filters;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ViewSwitcher
        options={MOVES_VIEW_OPTIONS}
        value={view}
        onChange={onViewChange}
        ariaLabel="Moves view"
      />

      <select
        value={quoteChannelFilter}
        onChange={(e) =>
          setQuoteChannelFilter(e.target.value as typeof quoteChannelFilter)
        }
        aria-label="Filter by quote channel"
        className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="all">All quote channels</option>
        <option value="web_ai">Website quote</option>
        <option value="phone">Phone quote</option>
        <option value="office">Office quote</option>
        <option value="web_review">Web booking · needs review</option>
      </select>

      <select
        value={repFilter}
        onChange={(e) => setRepFilter(e.target.value)}
        aria-label="Filter by salesperson"
        className="ml-auto h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="all">All salespeople</option>
        {reps.map((rep) => (
          <option key={rep} value={rep}>
            {rep}
          </option>
        ))}
      </select>
    </div>
  );
}
