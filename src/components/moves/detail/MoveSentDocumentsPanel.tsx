"use client";

import {
  buildMoveDocumentEngagement,
  documentKindLabel,
  documentMilestoneShortLabel,
  formatDocumentSentAt,
  nextDocumentMilestone,
  type MoveDocumentKind,
  type MoveDocumentMilestone,
} from "@/lib/moves/move-document-events";
import { resolveSentContract, resolveSentQuote } from "@/lib/moves/move-document-send";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, FileSignature, FileText } from "lucide-react";
import Link from "next/link";

type MoveSentDocumentsPanelProps = {
  move: MoveRecord;
};

export function MoveSentDocumentsPanel({ move }: MoveSentDocumentsPanelProps) {
  const quoteSent = resolveSentQuote(move);
  const contractSent = resolveSentContract(move);

  if (!quoteSent && !contractSent) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-500">
        No documents sent yet — send a quote or contract to start tracking customer engagement.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {quoteSent ? (
        <DocumentEngagementCard
          move={move}
          kind="quote"
          sentAt={quoteSent.sentAt}
          portalUrl={quoteSent.portalUrl}
        />
      ) : null}
      {contractSent ? (
        <DocumentEngagementCard
          move={move}
          kind="contract"
          sentAt={contractSent.sentAt}
          portalUrl={contractSent.portalUrl}
        />
      ) : null}
    </div>
  );
}

function DocumentEngagementCard({
  move,
  kind,
  sentAt,
  portalUrl,
}: {
  move: MoveRecord;
  kind: MoveDocumentKind;
  sentAt: string;
  portalUrl: string;
}) {
  const engagement = buildMoveDocumentEngagement(move, kind);
  const Icon = kind === "quote" ? FileText : FileSignature;

  if (!engagement) return null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-3.5",
        engagement.needsAttention ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Icon className="h-4 w-4 text-slate-500" />
            {documentKindLabel(kind)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Sent {formatDocumentSentAt(sentAt)}</p>
        </div>
        <Link
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Open portal
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <DocumentMilestoneTrack
        milestones={engagement.milestones}
        needsAttention={engagement.needsAttention}
        className="mt-3"
      />
    </div>
  );
}

type DocumentMilestoneTrackProps = {
  milestones: MoveDocumentMilestone[];
  needsAttention?: boolean;
  compact?: boolean;
  className?: string;
};

export function DocumentMilestoneTrack({
  milestones,
  needsAttention = false,
  compact = false,
  className,
}: DocumentMilestoneTrackProps) {
  const next = nextDocumentMilestone(milestones);
  const allDone = milestones.every((milestone) => milestone.done);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <ol
        className="flex w-full items-center"
        aria-label="Document progress"
      >
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;
          const isNext = needsAttention && next?.key === milestone.key;
          const isDone = milestone.done;

          return (
            <li
              key={milestone.key}
              className={cn("flex min-w-0 items-center", isLast ? "shrink-0" : "flex-1")}
            >
              <MilestoneStep
                milestone={milestone}
                isNext={isNext}
                compact={compact}
              />
              {!isLast ? (
                <span
                  className={cn(
                    "mx-1 h-0.5 min-w-[0.75rem] flex-1 rounded-full",
                    isDone ? "bg-emerald-300" : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {!compact && needsAttention && next ? (
        <p className="mt-2 text-[11px] font-medium text-amber-800">
          Waiting on {next.label.toLowerCase()}
        </p>
      ) : !compact && allDone ? (
        <p className="mt-2 text-[11px] font-medium text-emerald-700">Customer steps complete</p>
      ) : null}
    </div>
  );
}

function MilestoneStep({
  milestone,
  isNext,
  compact,
}: {
  milestone: MoveDocumentMilestone;
  isNext: boolean;
  compact: boolean;
}) {
  const label = documentMilestoneShortLabel(milestone.key);
  const tooltip = milestone.at ? formatDocumentSentAt(milestone.at) : "Not yet";

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-1"
      title={tooltip}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full border-2 transition-colors",
          compact ? "h-5 w-5" : "h-6 w-6",
          milestone.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : isNext
              ? "border-amber-400 bg-amber-50"
              : "border-slate-200 bg-white",
        )}
      >
        {milestone.done ? (
          <Check className={cn("shrink-0", compact ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
        ) : (
          <span
            className={cn(
              "rounded-full",
              compact ? "h-1.5 w-1.5" : "h-2 w-2",
              isNext ? "bg-amber-400" : "bg-slate-300",
            )}
            aria-hidden
          />
        )}
      </span>
      <span
        className={cn(
          "max-w-[4.5rem] text-center leading-tight",
          compact ? "text-[9px]" : "text-[10px]",
          milestone.done
            ? "font-medium text-emerald-800"
            : isNext
              ? "font-semibold text-amber-900"
              : "font-medium text-slate-500",
        )}
      >
        {label}
      </span>
    </div>
  );
}
