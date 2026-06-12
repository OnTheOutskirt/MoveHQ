"use client";

import { formatActivityTime } from "@/lib/moves/format";
import { getContextualQuickActions } from "@/lib/moves/move-workspace";
import type { MoveActivity, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  FileUp,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  StickyNote,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ACTION_ICONS: Record<string, LucideIcon> = {
  sms: MessageSquare,
  call: Phone,
  note: StickyNote,
  document: FileUp,
  crew: Users,
  "book-walkthrough": Calendar,
  "add-follow-up": Calendar,
  "view-profitability": FileText,
  "view-portal": MessageSquare,
};

type MoveDetailActivitySidebarProps = {
  move: MoveRecord;
};

function activityIcon(type: MoveActivity["type"]) {
  switch (type) {
    case "email":
      return "✉️";
    case "call":
      return "📞";
    case "document":
      return "📄";
    case "follow_up":
      return "🔔";
    case "status_change":
      return "↻";
    default:
      return "•";
  }
}

function demoFeedItems(move: MoveRecord): { id: string; at: string; title: string; detail?: string }[] {
  const extras: { id: string; at: string; title: string; detail?: string }[] = [];
  if (move.pipelineStage === "quote_sent" || move.pipelineStage === "booked") {
    extras.push({
      id: "demo-view",
      at: move.updatedAt,
      title: "Client viewed estimate",
      detail: "Link opened · 2 min read",
    });
  }
  if (move.pipelineStage === "booked") {
    extras.push({
      id: "demo-deposit",
      at: move.createdAt,
      title: "Deposit paid",
      detail: "$500 via card",
    });
  }
  if (move.jobDays.some((d) => d.crewSummary && !d.crewSummary.includes("Unassigned"))) {
    extras.push({
      id: "demo-crew",
      at: move.preferredDate,
      title: "Crew assigned",
      detail: move.jobDays[0]?.crewSummary,
    });
  }
  return extras;
}

export function MoveDetailActivitySidebar({ move }: MoveDetailActivitySidebarProps) {
  const actions = getContextualQuickActions(move);

  const activityItems = [...move.activities].map((a) => ({
    id: a.id,
    at: a.at,
    title: a.summary,
    detail: a.actor,
    kind: "activity" as const,
  }));

  const demoItems = demoFeedItems(move).map((d) => ({
    ...d,
    kind: "demo" as const,
  }));

  const feed = [...activityItems, ...demoItems].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  const primaryPhone = move.intake.clientPhone || move.customerPhone;
  const email = move.intake.clientEmail || move.customerEmail;

  return (
    <aside
      className="flex w-[min(100%,20rem)] shrink-0 flex-col border-l border-slate-200 bg-white sm:w-80"
      aria-label="Activity and quick actions"
    >
      <div className="shrink-0 border-b border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick actions
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400">Contextual to current stage</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action.id] ?? StickyNote;
            return (
              <button
                key={action.id}
                type="button"
                className={cn(
                  "inline-flex w-full items-center justify-start gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
                  action.primary
                    ? "border-brand-300 bg-brand-600 text-white hover:bg-brand-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800",
                )}
                title={`${action.label} — coming soon`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-b border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contact
        </p>
        <ul className="mt-2 space-y-2 text-sm">
          {primaryPhone ? (
            <li className="flex items-center gap-2 text-slate-800">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {primaryPhone}
            </li>
          ) : null}
          {email ? (
            <li className="flex items-center gap-2 text-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{email}</span>
            </li>
          ) : null}
          <li className="flex items-start gap-2 text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-2 text-xs">{move.originAddress}</span>
          </li>
        </ul>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-100 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Activity feed
          </p>
          <p className="text-[10px] text-slate-400">Calls, docs, dispatch, payments — unified</p>
        </div>
        <ul className="min-h-0 flex-1 space-y-0 overflow-y-auto">
          {feed.length === 0 ? (
            <li className="p-4 text-sm text-slate-500">No activity yet.</li>
          ) : (
            feed.map((item, i) => (
              <li
                key={item.id}
                className="relative border-b border-slate-100 px-3 py-3 last:border-0"
              >
                {i < feed.length - 1 ? (
                  <span
                    className="absolute left-[1.15rem] top-8 bottom-0 w-px bg-slate-200"
                    aria-hidden
                  />
                ) : null}
                <div className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">
                    {item.kind === "activity"
                      ? activityIcon(
                          move.activities.find((a) => a.id === item.id)?.type ?? "note",
                        )
                      : "✓"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    {item.detail ? (
                      <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatActivityTime(item.at)}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
