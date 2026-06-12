"use client";

import type { MovesFilters } from "@/components/moves/hooks/use-moves-filters";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import type { MovesViewMode } from "@/lib/moves/view-mode";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

const MOVES_VIEW_OPTIONS = [
  { id: "pipeline" as const, label: "Pipeline", icon: LayoutGrid },
  { id: "list" as const, label: "List", icon: List },
];

const SELECT_CLASS =
  "h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type MovesToolbarProps = {
  filters: MovesFilters;
  view: MovesViewMode;
  onViewChange: (view: MovesViewMode) => void;
};

export function MovesToolbar({ filters, view, onViewChange }: MovesToolbarProps) {
  const {
    repFilter,
    setRepFilter,
    quoteSourceFilter,
    setQuoteSourceFilter,
    quoteTypeFilter,
    setQuoteTypeFilter,
    leadScoreFilter,
    setLeadScoreFilter,
    reps,
  } = filters;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ViewSwitcher
        options={MOVES_VIEW_OPTIONS}
        value={view}
        onChange={onViewChange}
        ariaLabel="Moves view"
      />

      <div className={cn("ml-auto flex flex-wrap items-center justify-end gap-2")}>
        <select
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          aria-label="Filter by salesperson"
          className={SELECT_CLASS}
        >
          <option value="all">All salespeople</option>
          {reps.map((rep) => (
            <option key={rep} value={rep}>
              {rep}
            </option>
          ))}
        </select>

        <select
          value={quoteSourceFilter}
          onChange={(e) =>
            setQuoteSourceFilter(e.target.value as typeof quoteSourceFilter)
          }
          aria-label="Filter by quote source"
          className={SELECT_CLASS}
        >
          <option value="all">All quote sources</option>
          <option value="web">Web quotes</option>
          <option value="manual">Manual quotes</option>
        </select>

        <select
          value={quoteTypeFilter}
          onChange={(e) => setQuoteTypeFilter(e.target.value as typeof quoteTypeFilter)}
          aria-label="Filter by quote type"
          className={SELECT_CLASS}
        >
          <option value="all">All quote types</option>
          <option value="hourly">Hourly</option>
          <option value="flat">Flat rate</option>
        </select>

        <select
          value={leadScoreFilter}
          onChange={(e) => setLeadScoreFilter(e.target.value as typeof leadScoreFilter)}
          aria-label="Filter by lead score"
          className={SELECT_CLASS}
        >
          <option value="all">All lead scores</option>
          <option value="Q1">Q1 — priority</option>
          <option value="Q2">Q2 — strategic</option>
          <option value="Q3">Q3 — quick win</option>
          <option value="Q4">Q4 — nurture</option>
          <option value="unscored">Unscored</option>
        </select>
      </div>
    </div>
  );
}
