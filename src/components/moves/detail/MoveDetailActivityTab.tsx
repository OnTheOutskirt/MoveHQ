"use client";

import { formatActivityTime } from "@/lib/moves/format";
import { buildMoveActivityFeed } from "@/lib/moves/activity-feed";
import type { MoveActivity, MoveRecord } from "@/lib/moves/types";

type MoveDetailActivityTabProps = {
  move: MoveRecord;
};

const TYPE_LABELS: Record<MoveActivity["type"], string> = {
  note: "Note",
  status_change: "Status",
  call: "Call",
  email: "Email",
  document: "Document",
  follow_up: "Follow-up",
};

function activityIcon(type: MoveActivity["type"] | undefined) {
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

export function MoveDetailActivityTab({ move }: MoveDetailActivityTabProps) {
  const feed = buildMoveActivityFeed(move);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Complete activity log for this move — calls, emails, notes, status changes, and system
        events.
      </p>

      {feed.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
          No recorded activity
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
          {feed.map((item) => (
            <li key={item.id} className="flex gap-4 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                {activityIcon(item.activityType)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {item.kind === "demo" ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      System
                    </span>
                  ) : item.activityType ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      {TYPE_LABELS[item.activityType]}
                    </span>
                  ) : null}
                </div>
                {item.detail ? (
                  <p className="mt-0.5 text-sm text-slate-600">{item.detail}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">{formatActivityTime(item.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
