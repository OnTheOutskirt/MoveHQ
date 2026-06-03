"use client";

import { IntegrationCard } from "@/components/admin/integrations/IntegrationCard";
import { Card, CardContent } from "@/components/ui/Card";
import { INTEGRATION_CATALOG, type IntegrationPhase } from "@/lib/integrations/catalog";
import { useMemo } from "react";

const PHASES: { id: IntegrationPhase; label: string }[] = [
  { id: "v1", label: "V1" },
  { id: "v2", label: "V2" },
];

export function IntegrationsWorkspace() {
  const byPhase = useMemo(() => {
    const groups: Record<IntegrationPhase, typeof INTEGRATION_CATALOG> = { v1: [], v2: [] };
    for (const entry of INTEGRATION_CATALOG) groups[entry.phase].push(entry);
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-brand-100 bg-brand-50/40">
        <CardContent className="py-3 text-sm text-brand-950/90">
          <p>
            Third-party services to connect over time. Nothing is wired to live APIs yet — use
            this list to plan credentials, owners, and go-live order.
          </p>
        </CardContent>
      </Card>

      {PHASES.map(({ id, label }) => (
        <section key={id} className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {byPhase[id].map((entry) => (
              <li key={entry.id} className="min-w-0">
                <IntegrationCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
