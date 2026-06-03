"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Send, Smartphone } from "lucide-react";
import { useState } from "react";

export function DispatchPublishActions() {
  const { scheduleStatus, publishRecord, publishToCrewApp } = useDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const { complete, jobCount } = scheduleStatus;
  const published = Boolean(publishRecord);

  async function handlePublish() {
    publishToCrewApp();
    setConfirmOpen(false);
    setJustPublished(true);
    window.setTimeout(() => setJustPublished(false), 4000);
  }

  const publishedLabel = publishRecord
    ? new Date(publishRecord.publishedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {published && !justPublished ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            On crew app · {publishedLabel}
          </span>
        ) : null}

        {justPublished ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sent to crew app
          </span>
        ) : null}

        <Button
          type="button"
          size="sm"
          disabled={!complete}
          onClick={() => setConfirmOpen(true)}
          className={cn(complete && "shadow-sm")}
        >
          <Smartphone className="h-4 w-4" />
          {published ? "Update crew app" : "Send to crew app"}
        </Button>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setConfirmOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Send className="h-5 w-5 text-brand-600" />
              Send schedule to crew app?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {jobCount} job{jobCount === 1 ? "" : "s"} with crew and trucks assigned will appear on
              crew phones for this day. Dispatch can still be edited here afterward.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handlePublish}>
                Send to crew app
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
