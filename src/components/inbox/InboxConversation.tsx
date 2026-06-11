"use client";

import {
  CallDialHeaderAction,
  composerHeaderActionsClass,
} from "@/components/communications/composer-header-actions";
import { EmailDraftProvider } from "@/components/communications/EmailDraftProvider";
import { EmailOpenMailHeaderButton } from "@/components/communications/EmailOpenMailHeaderButton";
import { InboxComposer } from "@/components/inbox/InboxComposer";
import { InboxMessageFeed } from "@/components/inbox/InboxMessageFeed";
import { useMoves } from "@/components/moves/MovesProvider";
import type { InboxChannel, InboxThread } from "@/lib/inbox/types";
import { pipelineStageLabel } from "@/lib/moves/move-pipeline";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { ExternalLink, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const CHANNEL_TABS: { id: InboxChannel | "all"; label: string; icon?: typeof Phone }[] = [
  { id: "all", label: "All" },
  { id: "call", label: "Calls", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
];

type InboxConversationProps = {
  thread: InboxThread;
};

export function InboxConversation({ thread }: InboxConversationProps) {
  const { getMoveById } = useMoves();
  const move = getMoveById(thread.moveId);
  const [channelTab, setChannelTab] = useState<InboxChannel | "all">("all");

  const composerChannel: InboxChannel = useMemo(() => {
    if (channelTab !== "all") return channelTab;
    return thread.lastChannel;
  }, [channelTab, thread.lastChannel]);

  if (!move) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
        Move not found.
      </div>
    );
  }

  const showDial = composerChannel === "call" && Boolean(move.customerPhone);
  const showOpenMail = composerChannel === "email" && Boolean(move.customerEmail);

  return (
    <EmailDraftProvider
      email={move.customerEmail}
      defaultSubject={`Re: ${move.reference}`}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={salesMovePath(thread.moveId)}
                className="group inline-flex items-center gap-1.5 text-base font-semibold text-slate-900 hover:text-brand-700"
              >
                {thread.customerName}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <p className="mt-0.5 text-sm text-slate-600">
                <span className="font-mono text-xs text-slate-500">{thread.moveReference}</span>
                <span className="text-slate-300"> · </span>
                {pipelineStageLabel(move.pipelineStage)}
                <span className="text-slate-300"> · </span>
                {thread.assignedRep}
              </p>
            </div>
            <div className={composerHeaderActionsClass()}>
              {showDial ? <CallDialHeaderAction phone={move.customerPhone!} /> : null}
              {showOpenMail ? <EmailOpenMailHeaderButton /> : null}
              {thread.needsReply ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                  Needs reply
                </span>
              ) : null}
            </div>
          </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {CHANNEL_TABS.map((tab) => {
            const active = channelTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannelTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-100 text-brand-800"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {Icon ? <Icon className="h-3 w-3" /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <InboxMessageFeed messages={thread.messages} channelFilter={channelTab} />

        <div className="shrink-0 border-t border-slate-200 bg-slate-50/90 px-4 py-3">
          <InboxComposer channel={composerChannel} move={move} />
        </div>
      </div>
    </EmailDraftProvider>
  );
}
