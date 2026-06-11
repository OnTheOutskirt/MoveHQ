"use client";

import { IntegrationCard } from "@/components/admin/integrations/IntegrationCard";
import { Card, CardContent } from "@/components/ui/Card";
import {
  V1_INTEGRATION_SECTIONS,
  V2_INTEGRATION_SECTIONS,
  integrationsForSection,
} from "@/lib/integrations/catalog";

const PHASE_INTROS = {
  v1: {
    label: "V1 — September launch",
    description:
      "Ten connections cover everything in the roadmap: platform, comms, payments, maps, AI, and monitoring. Customer proposals, e-sign, and the crew app are built into MoveHQ — no DocuSign or separate crew vendor for V1.",
  },
  v2: {
    label: "V2 — After launch",
    description:
      "Payroll API, fleet GPS, Gmail, marketing tags, voice AI, and website chatbot — once V1 comms and data are stable.",
  },
} as const;

export function IntegrationsWorkspace() {
  return (
    <div className="space-y-8">
      <Card className="border-brand-100 bg-brand-50/40">
        <CardContent className="py-3 text-sm text-brand-950/90">
          <p>
            Plan credentials, owners, and go-live order here. Nothing calls live APIs in this demo
            yet — wiring happens alongside Supabase migration in the roadmap.
          </p>
        </CardContent>
      </Card>

      <PhaseBlock
        intro={PHASE_INTROS.v1}
        sections={V1_INTEGRATION_SECTIONS}
      />

      <PhaseBlock
        intro={PHASE_INTROS.v2}
        sections={V2_INTEGRATION_SECTIONS}
      />
    </div>
  );
}

function PhaseBlock({
  intro,
  sections,
}: {
  intro: { label: string; description: string };
  sections: typeof V1_INTEGRATION_SECTIONS;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{intro.label}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">{intro.description}</p>
      </div>

      {sections.map((section) => {
        const entries = integrationsForSection(section);
        if (entries.length === 0) return null;
        return (
          <section key={section.id} className="space-y-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section.label}
              </h3>
              <p className="text-xs text-slate-500">{section.description}</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => (
                <li key={entry.id} className="min-w-0">
                  <IntegrationCard entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
