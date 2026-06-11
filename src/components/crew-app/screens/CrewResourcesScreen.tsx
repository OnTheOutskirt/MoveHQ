"use client";

import { readCrewResourcesConfig, type CrewResourceLink } from "@/lib/crew-app/crew-resources-config";
import { ExternalLink, Heart, Wallet } from "lucide-react";
import { useMemo } from "react";

const CATEGORY_ICON = {
  payroll: Wallet,
  benefits: Heart,
  other: ExternalLink,
};

export function CrewResourcesScreen() {
  const links = useMemo(() => readCrewResourcesConfig().links, []);

  const grouped = useMemo(() => {
    const map: Record<string, CrewResourceLink[]> = {
      payroll: [],
      benefits: [],
      other: [],
    };
    for (const link of links) {
      map[link.category].push(link);
    }
    return map;
  }, [links]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Payroll, benefits, and other links configured by your office in MoveHQ admin.
      </p>
      {(["payroll", "benefits", "other"] as const).map((cat) =>
        grouped[cat].length > 0 ? (
          <section key={cat}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cat === "payroll" ? "Payroll" : cat === "benefits" ? "Benefits" : "Other"}
            </h2>
            <ul className="space-y-2">
              {grouped[cat].map((link) => {
                const Icon = CATEGORY_ICON[link.category];
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-300"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-900">{link.label}</span>
                        {link.description ? (
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {link.description}
                          </span>
                        ) : null}
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
