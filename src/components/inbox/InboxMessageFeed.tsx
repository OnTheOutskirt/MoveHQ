"use client";

import { formatActivityTime } from "@/lib/moves/format";
import type { InboxChannel, InboxMessage } from "@/lib/inbox/types";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CHANNEL_ICONS: Record<InboxChannel, LucideIcon> = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
};

type InboxMessageFeedProps = {
  messages: InboxMessage[];
  channelFilter?: InboxChannel | "all";
};

export function InboxMessageFeed({ messages, channelFilter = "all" }: InboxMessageFeedProps) {
  const visible =
    channelFilter === "all"
      ? messages
      : messages.filter((m) => m.channel === channelFilter);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-50/80 to-white">
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-4 py-4">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No messages in this channel yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((item) => {
              const isOutbound = item.direction === "outbound";
              const Icon = CHANNEL_ICONS[item.channel];
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
                      !item.read && !isOutbound && "ring-2 ring-brand-200/80",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                        isOutbound ? "text-brand-100" : "text-slate-400",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {item.channel}
                      {!item.read && !isOutbound ? (
                        <span className="normal-case text-brand-600">· unread</span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isOutbound ? "text-white" : "text-slate-800",
                      )}
                    >
                      {item.body}
                    </p>
                    <p
                      className={cn(
                        "mt-1 flex flex-wrap items-center gap-x-2 text-[10px]",
                        isOutbound ? "text-brand-100" : "text-slate-400",
                      )}
                    >
                      <span>{formatActivityTime(item.at)}</span>
                      {item.actor ? <span>· {item.actor}</span> : null}
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
