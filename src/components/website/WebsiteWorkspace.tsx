"use client";

import { useRepFilter } from "@/components/moves/hooks/use-rep-filter";
import { WebsiteQueueBoard } from "@/components/website/WebsiteQueueBoard";
import { useMoves } from "@/components/moves/MovesProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { isWebAiQuote, websiteQueueTotal } from "@/lib/moves/acquisition";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import { pageMeta } from "@/lib/navigation/page-meta";
import { Globe } from "lucide-react";
import { useMemo } from "react";

const meta = pageMeta["/sales/web-quotes"];

export function WebsiteWorkspace() {
  const { moves } = useMoves();
  const webMoves = useMemo(
    () => moves.filter((m) => isWebAiQuote(m) && !isMoveLost(m)),
    [moves],
  );
  const { repFilter, setRepFilter, reps, repFilteredMoves } = useRepFilter(webMoves);

  const queueCount = useMemo(() => websiteQueueTotal(repFilteredMoves), [repFilteredMoves]);
  const hasWebMoves = webMoves.length > 0;

  return (
    <div className="space-y-4">
      <PageHeader title={meta.title} description={meta.description} />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          aria-label="Filter by salesperson"
          className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All salespeople</option>
          {reps.map((rep) => (
            <option key={rep} value={rep}>
              {rep}
            </option>
          ))}
        </select>
        <p className="text-sm text-slate-500">
          {queueCount} in web queues
          {repFilter !== "all" ? ` · ${repFilter}` : ""}
        </p>
      </div>

      {!hasWebMoves ? (
        <EmptyState
          icon={Globe}
          title="No web flat-rate quotes yet"
          description="Moves appear here when someone starts an online flat-rate quote — incomplete intake, quoted but not booked, or booked and pending review."
        />
      ) : queueCount === 0 ? (
        <EmptyState
          icon={Globe}
          title="No moves in these queues"
          description={
            repFilter === "all"
              ? "Nothing currently matches incomplete, quoted, or booked-needs-review."
              : `No web queue items assigned to ${repFilter}.`
          }
        />
      ) : (
        <WebsiteQueueBoard moves={repFilteredMoves} />
      )}
    </div>
  );
}
