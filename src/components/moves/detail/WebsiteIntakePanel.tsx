"use client";

import { QuoteChannelBadge } from "@/components/moves/shared/QuoteChannelBadge";
import {
  intakeProgressLabel,
  isWebAiQuote,
  quoteChannelLabel,
  resolveIntakeProgress,
} from "@/lib/moves/acquisition";
import { leadChannelLabel } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { Globe } from "lucide-react";

/** Compact web-AI context — not a full card. */
export function WebsiteIntakeStrip({ move }: { move: MoveRecord }) {
  if (!isWebAiQuote(move)) return null;

  const meta = move.websiteIntake;
  const progress = resolveIntakeProgress(move);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        Website intake
      </span>
      <QuoteChannelBadge move={move} showIntakeProgress size="sm" />
      <span>{quoteChannelLabel(move.quoteChannel)}</span>
      <span>{intakeProgressLabel(progress)}</span>
      <span className="text-slate-400">Lead · {leadChannelLabel(move.leadChannel)}</span>
      {meta?.sessionId ? (
        <span className="font-mono text-[10px] text-slate-400">{meta.sessionId}</span>
      ) : null}
    </div>
  );
}

/** @deprecated Use WebsiteIntakeStrip */
export function WebsiteIntakePanel({ move }: { move: MoveRecord }) {
  return <WebsiteIntakeStrip move={move} />;
}
