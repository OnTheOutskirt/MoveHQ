"use client";

import { useTesterFeedback } from "@/components/providers/TesterFeedbackProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import {
  TESTER_FEEDBACK_KINDS,
  TESTER_FEEDBACK_KIND_LABELS,
  type TesterFeedbackKind,
} from "@/lib/planning/tester-feedback";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { cn } from "@/lib/utils";
import { MessageSquareWarning } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ReportFeedbackMenu() {
  const { user } = useSession();
  const { submitFeedback } = useTesterFeedback();
  const clientReady = useClientReady();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<TesterFeedbackKind>("bug");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setDescription("");
      setKind("bug");
    }
  }, [open]);

  if (!clientReady) return null;

  const pageTitle =
    typeof document !== "undefined" ? document.title.replace(/\s*·.*$/, "").trim() : undefined;

  function handleSubmit() {
    const trimmed = description.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    submitFeedback({
      kind,
      description: trimmed,
      pagePath: pathname,
      pageTitle: pageTitle || undefined,
      reporterId: user.id,
      reporterName: user.name,
    });
    setSubmitted(true);
    setDescription("");
    setSubmitting(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2 text-amber-900 sm:px-2.5",
          "border-amber-300 bg-amber-50 hover:bg-amber-100",
          "ring-2 ring-amber-400/30 ring-offset-1",
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Report issue or improvement"
        title="Report a bug, improvement, or question while testing"
      >
        <MessageSquareWarning className="h-4 w-4 shrink-0 text-amber-700" />
        <span className="hidden text-xs font-semibold sm:inline">Report</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-lg">
          <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Report while testing</p>
            <p className="mt-0.5 text-xs text-slate-600">
              Log bugs, improvements, or questions — they show up in Move HQ Planning.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm font-medium text-emerald-800">Thanks — report saved.</p>
              <p className="text-xs text-slate-600">
                Track and triage it under Planning → Tester feedback.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Link
                  href="/planning?tab=feedback"
                  className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                  onClick={() => setOpen(false)}
                >
                  Open Planning
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 px-4 py-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">What is it?</span>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as TesterFeedbackKind)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                >
                  {TESTER_FEEDBACK_KINDS.map((option) => (
                    <option key={option} value={option}>
                      {TESTER_FEEDBACK_KIND_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="What happened, what you expected, or what you'd change…"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm leading-relaxed"
                  autoFocus
                />
              </label>

              <p className="text-[11px] text-slate-500">
                Page: <span className="font-medium text-slate-700">{pathname}</span>
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!description.trim() || submitting}
                  onClick={handleSubmit}
                >
                  Submit report
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
