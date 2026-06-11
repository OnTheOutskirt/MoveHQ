"use client";

import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  walkthroughShareActivityLabel,
  walkthroughUsesInlineComposer,
  type WalkthroughShareKind,
} from "@/lib/moves/walkthrough-meeting-links";
import type { WalkthroughComposeChannel } from "@/components/moves/detail/quick-actions/WalkthroughMessageCompose";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

type WalkthroughLinkShareBarProps = {
  kind: WalkthroughShareKind;
  move: MoveRecord;
  linkUrl: string;
  linkLabel?: string;
  assignee?: string;
  showPreview?: boolean;
  className?: string;
  onCompose?: (channel: WalkthroughComposeChannel) => void;
};

export function WalkthroughLinkShareBar({
  kind,
  move,
  linkUrl,
  linkLabel = "Link",
  assignee,
  showPreview = false,
  className,
  onCompose,
}: WalkthroughLinkShareBarProps) {
  const { recordWalkthroughLinkSent } = useMovesActions();
  const [copied, setCopied] = useState(false);

  const email = move.customerEmail?.trim() ?? "";
  const phone = move.customerPhone?.trim() ?? "";
  const activityLabel = walkthroughShareActivityLabel(kind);
  const useComposer = walkthroughUsesInlineComposer(kind) && onCompose;

  async function handleCopy() {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      recordWalkthroughLinkSent(
        move.id,
        assignee ?? "",
        linkUrl,
        `${activityLabel} (copied)`,
      );
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase text-slate-500">{linkLabel}</p>
        <p className="mt-1 break-all font-mono text-xs text-brand-700">{linkUrl || "…"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!linkUrl}
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!email || !useComposer}
          onClick={() => onCompose?.("email")}
          title={email ? `Email ${email}` : "No customer email on file"}
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!phone || !useComposer}
          onClick={() => onCompose?.("sms")}
          title={phone ? `Text ${phone}` : "No customer phone on file"}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          SMS
        </Button>
        {showPreview && linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Preview
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      {!email && !phone ? (
        <p className="text-xs text-amber-700">
          Add customer email or phone on the move to send messages.
        </p>
      ) : null}
    </div>
  );
}
