"use client";

import { useTesterFeedback } from "@/components/providers/TesterFeedbackProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatMoveDate } from "@/lib/moves/format";
import {
  countTesterFeedbackByStatus,
  openTesterFeedbackCount,
  TESTER_FEEDBACK_KIND_LABELS,
  TESTER_FEEDBACK_KINDS,
  TESTER_FEEDBACK_STATUS_LABELS,
  TESTER_FEEDBACK_STATUSES,
  type TesterFeedback,
  type TesterFeedbackKind,
  type TesterFeedbackStatus,
} from "@/lib/planning/tester-feedback";
import { cn } from "@/lib/utils";
import { ExternalLink, MessageSquareWarning, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const KIND_BADGE: Record<TesterFeedbackKind, string> = {
  bug: "bg-rose-100 text-rose-900",
  improvement: "bg-sky-100 text-sky-900",
  question: "bg-amber-100 text-amber-900",
  polish: "bg-violet-100 text-violet-900",
  other: "bg-slate-100 text-slate-700",
};

const STATUS_BADGE: Record<TesterFeedbackStatus, string> = {
  open: "bg-amber-100 text-amber-900",
  planned: "bg-brand-100 text-brand-800",
  done: "bg-emerald-100 text-emerald-900",
  wont_fix: "bg-slate-200 text-slate-700",
};

export function TesterFeedbackView() {
  const { isReady, storage, syncError, items, updateFeedbackStatus, removeFeedback } =
    useTesterFeedback();
  const [kindFilter, setKindFilter] = useState<TesterFeedbackKind | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TesterFeedbackStatus>("open");

  const statusCounts = useMemo(() => countTesterFeedbackByStatus(items), [items]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => (kindFilter === "all" ? true : item.kind === kindFilter))
      .filter((item) => item.status === statusFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, kindFilter, statusFilter]);

  const openCount = useMemo(() => openTesterFeedbackCount(items), [items]);

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading tester feedback…</p>;
  }

  return (
    <div className="space-y-5">
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex items-start gap-3 py-5">
          <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Tester feedback</p>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Reports submitted from the amber Report button in the top bar while people test Move
              HQ. Reports sync for everyone on the deployed app — triage here and update status as
              items are planned or resolved.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {openCount} open or planned · {items.length} total
              {storage === "blob"
                ? " · shared storage"
                : storage === "local"
                  ? " · local dev storage"
                  : null}
            </p>
            {storage === "unconfigured" ? (
              <p className="mt-2 text-xs text-amber-800">
                Shared storage is not configured on Vercel yet. Add a Blob store and set{" "}
                <code className="rounded bg-amber-100 px-1">BLOB_READ_WRITE_TOKEN</code> so reports
                from testers persist for everyone.
              </p>
            ) : null}
            {syncError ? (
              <p className="mt-2 text-xs text-red-700">Sync issue: {syncError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TESTER_FEEDBACK_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === status
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {TESTER_FEEDBACK_STATUS_LABELS[status]}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  statusFilter === status ? "text-brand-700" : "text-slate-400",
                )}
              >
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          Type
          <select
            value={kindFilter}
            onChange={(event) =>
              setKindFilter(event.target.value as TesterFeedbackKind | "all")
            }
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
          >
            <option value="all">All types</option>
            {TESTER_FEEDBACK_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {TESTER_FEEDBACK_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="py-12 text-center">
            <MessageSquareWarning className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No {TESTER_FEEDBACK_STATUS_LABELS[statusFilter].toLowerCase()} reports
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter === "open"
                ? "Use the Report button in the top bar while testing the app."
                : "Try another status tab or type filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <FeedbackRow
              key={item.id}
              item={item}
              onStatusChange={updateFeedbackStatus}
              onRemove={removeFeedback}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedbackRow({
  item,
  onStatusChange,
  onRemove,
}: {
  item: TesterFeedback;
  onStatusChange: (id: string, status: TesterFeedbackStatus) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("text-[10px]", KIND_BADGE[item.kind])}>
              {TESTER_FEEDBACK_KIND_LABELS[item.kind]}
            </Badge>
            <Badge className={cn("text-[10px]", STATUS_BADGE[item.status])}>
              {TESTER_FEEDBACK_STATUS_LABELS[item.status]}
            </Badge>
            <span className="text-xs text-slate-500">
              {formatMoveDate(item.createdAt.slice(0, 10))} · {item.reporterName}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link
              href={item.pagePath}
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
            >
              {item.pageTitle ?? item.pagePath}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={item.status}
            onChange={(event) =>
              onStatusChange(item.id, event.target.value as TesterFeedbackStatus)
            }
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
            aria-label="Update status"
          >
            {TESTER_FEEDBACK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TESTER_FEEDBACK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="px-2 text-slate-500 hover:text-red-700"
            onClick={() => onRemove(item.id)}
            aria-label="Remove report"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
