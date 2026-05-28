"use client";

import { IntegrationCard } from "@/components/admin/integrations/IntegrationCard";
import { Card, CardContent } from "@/components/ui/Card";
import {
  INTEGRATION_CATALOG,
  INTEGRATION_STATUS_LABELS,
  type IntegrationStatus,
} from "@/lib/integrations/catalog";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type FilterStatus = "all" | IntegrationStatus;

export function IntegrationsWorkspace() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return INTEGRATION_CATALOG;
    return INTEGRATION_CATALOG.filter((i) => i.status === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const c = { planned: 0, v2: 0, not_started: 0 };
    for (const i of INTEGRATION_CATALOG) c[i.status]++;
    return c;
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-brand-100 bg-brand-50/40">
        <CardContent className="py-3 text-sm text-brand-950/90">
          <p>
            Third-party services to connect over time. Nothing is wired to live APIs yet — use
            this list to plan credentials, owners, and go-live order.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(["all", "planned", "v2"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === id
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {id === "all"
              ? `All (${INTEGRATION_CATALOG.length})`
              : `${INTEGRATION_STATUS_LABELS[id].label} (${counts[id]})`}
          </button>
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <li key={entry.id} className="min-w-0">
            <IntegrationCard entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}
