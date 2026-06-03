"use client";

import { DetailFieldGrid } from "@/components/moves/detail/DetailSection";
import { QuoteChannelBadge } from "@/components/moves/shared/QuoteChannelBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  intakeProgressLabel,
  isWebAiQuote,
  quoteChannelLabel,
  resolveIntakeProgress,
} from "@/lib/moves/acquisition";
import { leadChannelLabel } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { Globe } from "lucide-react";

function formatTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function WebsiteIntakePanel({ move }: { move: MoveRecord }) {
  if (!isWebAiQuote(move)) return null;

  const meta = move.websiteIntake;
  const progress = resolveIntakeProgress(move);

  return (
    <Card className="border-sky-200 bg-sky-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-sky-700" />
          <CardTitle className="text-base text-sky-950">Website AI quote</CardTitle>
        </div>
        <p className="text-sm text-sky-900/80">
          This move came through the flat-rate quoting tool. Lead source (marketing) is separate
          from how the quote was built.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <QuoteChannelBadge move={move} showIntakeProgress size="md" />
        </div>

        <DetailFieldGrid cols={2}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Quote built via
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{quoteChannelLabel(move.quoteChannel)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Lead source (marketing)
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{leadChannelLabel(move.leadChannel)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Intake progress
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{intakeProgressLabel(progress)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Legacy source field
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{move.source}</p>
          </div>
          {meta?.sessionId ? (
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Session
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-700">{meta.sessionId}</p>
            </div>
          ) : null}
          {meta?.lastStepCompleted ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Last step completed
              </p>
              <p className="mt-0.5 text-sm text-slate-900">{meta.lastStepCompleted}</p>
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Quoted at
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{formatTs(meta?.quotedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Booked at
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{formatTs(meta?.bookedAt)}</p>
          </div>
        </DetailFieldGrid>
      </CardContent>
    </Card>
  );
}
