"use client";

import { formatActivityTime } from "@/lib/moves/format";
import {
  communicationHistoryLabel,
  type CommunicationHistoryItem,
} from "@/lib/moves/communication-history";
import type { HistoryQuickActionId } from "@/lib/moves/quick-actions";
import { cn } from "@/lib/utils";

type QuickActionHistoryFeedProps = {
  action: HistoryQuickActionId;
  items: CommunicationHistoryItem[];
};

function historyIcon(item: CommunicationHistoryItem): string {
  switch (item.source) {
    case "follow_up":
      return "🔔";
    case "demo":
      return "✓";
    default:
      return "•";
  }
}

function bubbleAlign(item: CommunicationHistoryItem, index: number, total: number): "left" | "right" {
  if (item.source === "demo") return "left";
  if (item.actor === "System") return "left";
  return index === total - 1 ? "right" : "left";
}

export function QuickActionHistoryFeed({ action, items }: QuickActionHistoryFeedProps) {
  const label = communicationHistoryLabel(action);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-50/80 to-white">
      <div className="shrink-0 border-b border-slate-100 bg-white/90 px-4 py-2.5 backdrop-blur-sm">
        <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No {label.toLowerCase()} yet. Start below.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item, index) => {
              const side = bubbleAlign(item, index, items.length);
              const isOutbound = side === "right";
              return (
                <li
                  key={item.id}
                  className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm",
                      isOutbound
                        ? "rounded-br-md bg-brand-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-900",
                    )}
                  >
                    <p className={cn("text-sm leading-snug", isOutbound ? "text-white" : "text-slate-800")}>
                      {item.summary}
                    </p>
                    <p
                      className={cn(
                        "mt-1 flex flex-wrap items-center gap-x-2 text-[10px]",
                        isOutbound ? "text-brand-100" : "text-slate-400",
                      )}
                    >
                      <span>{formatActivityTime(item.at)}</span>
                      {item.actor ? <span>· {item.actor}</span> : null}
                      {item.source === "follow_up" ? <span>· follow-up</span> : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
