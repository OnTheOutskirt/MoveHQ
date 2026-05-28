"use client";

import { TECH_STACK } from "@/lib/planning/roadmap-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Bot,
  Cloud,
  CreditCard,
  Database,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plug,
  Server,
  Truck,
} from "lucide-react";

const ICON_BY_NAME: Record<string, typeof Server> = {
  "MoveHQ app": Server,
  "Next.js": Server,
  Supabase: Database,
  Vercel: Cloud,
  Resend: Mail,
  Stripe: CreditCard,
  "Google Maps Platform": MapPin,
  "Microsoft Graph": Plug,
  "Microsoft Outlook": Plug,
  Twilio: MessageSquare,
  LiveSwitch: Phone,
  OpenAI: Bot,
  "Vapi or Retell": Phone,
  Rippling: Plug,
  Samsara: Truck,
};

function StackCard({ item }: { item: (typeof TECH_STACK)[number] }) {
  const Icon = ICON_BY_NAME[item.name] ?? Server;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3",
        item.phase === "v1"
          ? "border-slate-100 bg-slate-50/50"
          : "border-violet-100 bg-violet-50/30",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className="h-4 w-4 text-brand-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{item.name}</p>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              item.phase === "v1" ? "bg-brand-100 text-brand-800" : "bg-violet-100 text-violet-800",
            )}
          >
            {item.phase}
          </span>
        </div>
        <p className="text-xs font-medium text-brand-700">{item.role}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</p>
        {item.builderDetail ? (
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Build: {item.builderDetail}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function TechStackPanel() {
  const v1 = TECH_STACK.filter((t) => t.phase === "v1");
  const v2 = TECH_STACK.filter((t) => t.phase === "v2");

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Tech stack</CardTitle>
        <p className="text-sm text-slate-500">
          The main vendors and platforms behind MoveHQ — what each one does for the business
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            V1 — September 1 launch
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {v1.map((item) => (
              <StackCard key={item.name} item={item} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-600">
            V2 — AI comms &amp; voice
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {v2.map((item) => (
              <StackCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
