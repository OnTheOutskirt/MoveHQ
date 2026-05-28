"use client";

import { COMMS_ROADMAP } from "@/lib/planning/roadmap-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Bot, MessageSquare, Phone } from "lucide-react";

export function CommsRoadmapPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Phone, texting & email</CardTitle>
        <p className="text-sm text-slate-500">
          What customers experience in Version 1 vs smarter automation in Version 2
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-700" />
            <p className="text-sm font-semibold text-brand-900">{COMMS_ROADMAP.v1.title}</p>
          </div>
          <ul className="mt-3 space-y-2">
            {COMMS_ROADMAP.v1.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-brand-950/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-violet-700" />
            <p className="text-sm font-semibold text-violet-900">{COMMS_ROADMAP.v2.title}</p>
          </div>
          <ul className="mt-3 space-y-2">
            {COMMS_ROADMAP.v2.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-violet-950/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-violet-700">
            <Phone className="h-3.5 w-3.5" />
            Build note: V2 AI builds on the texting setup finished in July
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
