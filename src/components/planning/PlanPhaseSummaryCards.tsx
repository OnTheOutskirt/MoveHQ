"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { V1_MONTH_FOCUS } from "@/lib/planning/roadmap-data";
import { cn } from "@/lib/utils";
import { Layout, Monitor, Smartphone } from "lucide-react";

const PHASES = [
  { key: "june" as const, icon: Layout, accent: "slate" as const },
  { key: "july" as const, icon: Monitor, accent: "brand" as const },
  { key: "august" as const, icon: Smartphone, accent: "emerald" as const },
];

export function PlanPhaseSummaryCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PHASES.map(({ key, icon: Icon, accent }) => {
        const focus = V1_MONTH_FOCUS[key];
        return (
          <Card
            key={key}
            className={cn(
              accent === "brand" && "border-brand-200 bg-brand-50/40",
              accent === "emerald" && "border-emerald-200 bg-emerald-50/40",
              accent === "slate" && "border-slate-200 bg-slate-50/60",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    accent === "brand" && "text-brand-700",
                    accent === "emerald" && "text-emerald-700",
                    accent === "slate" && "text-slate-600",
                  )}
                />
                <div>
                  <CardTitle className="text-base">{focus.title}</CardTitle>
                  <p className="text-xs font-medium text-slate-500">{focus.deadline}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{focus.summary}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {focus.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        accent === "brand" && "bg-brand-500",
                        accent === "emerald" && "bg-emerald-500",
                        accent === "slate" && "bg-slate-400",
                      )}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
