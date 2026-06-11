"use client";

import {
  buildMoveCustomerPortalPath,
  isMovePostComplete,
} from "@/lib/moves/move-customer-portal";
import type { MoveRecord } from "@/lib/moves/types";
import { ExternalLink, MessageSquareHeart, Smartphone } from "lucide-react";
import Link from "next/link";

type MoveCustomerPortalPanelProps = {
  move: MoveRecord;
};

export function MoveCustomerPortalPanel({ move }: MoveCustomerPortalPanelProps) {
  const portalPath = buildMoveCustomerPortalPath(move.id);
  const feedbackPreviewPath = buildMoveCustomerPortalPath(move.id, {
    previewFeedback: true,
  });
  const postComplete = isMovePostComplete(move);

  return (
    <div className="border-b border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Customer portal
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        One link per move — quote, contract, and post-move crew feedback. After completion,
        automations send customers here to rate their crew.
      </p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        <Link
          href={portalPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-brand-700 hover:border-brand-200 hover:bg-brand-50"
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          Open customer portal
          <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-60" />
        </Link>
        <Link
          href={feedbackPreviewPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        >
          <MessageSquareHeart className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          Preview crew feedback
          {!postComplete ? (
            <span className="text-[10px] font-normal text-slate-400">(staff)</span>
          ) : null}
          <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-60" />
        </Link>
      </div>
    </div>
  );
}
