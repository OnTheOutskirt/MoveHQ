"use client";

import {
  composerHeaderActionsClass,
} from "@/components/communications/composer-header-actions";
import { EmailOpenMailHeaderButton } from "@/components/communications/EmailOpenMailHeaderButton";
import { QuickActionHistoryFeed } from "@/components/moves/detail/quick-actions/QuickActionHistoryFeed";
import {
  WalkthroughMessageCompose,
  type WalkthroughComposeChannel,
} from "@/components/moves/detail/quick-actions/WalkthroughMessageCompose";
import { getCommunicationHistory } from "@/lib/moves/communication-history";
import type { WalkthroughShareKind } from "@/lib/moves/walkthrough-meeting-links";
import type { MoveRecord } from "@/lib/moves/types";
import { Mail, MessageSquare } from "lucide-react";
import { useMemo } from "react";

export type WalkthroughComposeState = {
  channel: WalkthroughComposeChannel;
  kind: WalkthroughShareKind;
  linkUrl: string;
  assignee?: string;
  slotLabel?: string;
};

export function walkthroughComposerFooterClassName(): string {
  return "border-t border-slate-200 bg-slate-50/90 px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]";
}

type WalkthroughComposeSidebarChrome = {
  title: string;
  description: string;
  headerExtra: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
  usesEmailDraft: boolean;
};

export function useWalkthroughComposeSidebarChrome(
  move: MoveRecord | null,
  compose: WalkthroughComposeState | null,
  onCloseCompose: () => void,
): WalkthroughComposeSidebarChrome | null {
  const history = useMemo(
    () => (move && compose ? getCommunicationHistory(move, compose.channel) : []),
    [move, compose],
  );

  if (!move || !compose) return null;

  const title = compose.channel === "email" ? "Email" : "Text message";
  const description =
    compose.channel === "email"
      ? move.customerEmail?.trim() || move.customerName
      : move.customerPhone?.trim() || move.customerName;

  return {
    title,
    description,
    headerExtra: (
      <div className={composerHeaderActionsClass()}>
        {compose.channel === "email" ? <EmailOpenMailHeaderButton /> : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {compose.channel === "email" ? (
            <Mail className="h-3 w-3" />
          ) : (
            <MessageSquare className="h-3 w-3" />
          )}
          {move.customerName}
        </span>
      </div>
    ),
    body: <QuickActionHistoryFeed action={compose.channel} items={history} />,
    footer: (
      <div className={walkthroughComposerFooterClassName()}>
        <WalkthroughMessageCompose
          channel={compose.channel}
          kind={compose.kind}
          move={move}
          linkUrl={compose.linkUrl}
          assignee={compose.assignee}
          slotLabel={compose.slotLabel}
          onClose={onCloseCompose}
        />
      </div>
    ),
    usesEmailDraft: compose.channel === "email",
  };
}
