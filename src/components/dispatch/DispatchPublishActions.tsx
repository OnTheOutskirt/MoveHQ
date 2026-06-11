"use client";

import { DispatchDayRequirementsBar } from "@/components/dispatch/DispatchDayRequirementsBar";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CheckCircle2, Send, Smartphone, Undo2 } from "lucide-react";
import { useState } from "react";

export function DispatchPublishToolbar() {
  const {
    scheduleStatus,
    publishRecord,
    hasUnpublishedChanges,
    publishToCrewApp,
    unpublishFromCrewApp,
  } = useDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [justUnpublished, setJustUnpublished] = useState(false);

  const { complete, jobCount } = scheduleStatus;
  const published = Boolean(publishRecord);
  const canPublish = complete && (!published || hasUnpublishedChanges);

  const publishedLabel = publishRecord
    ? new Date(publishRecord.publishedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  function handlePublish() {
    publishToCrewApp();
    setConfirmOpen(false);
    setJustPublished(true);
    setJustUnpublished(false);
    window.setTimeout(() => setJustPublished(false), 4000);
  }

  function handleUnpublish() {
    unpublishFromCrewApp();
    setJustPublished(false);
    setJustUnpublished(true);
    window.setTimeout(() => setJustUnpublished(false), 4000);
  }

  const showFloatingPublish = justPublished || justUnpublished || published;

  return (
    <>
      <div className="relative ml-auto flex min-w-0 shrink-0 items-center gap-2">
        {showFloatingPublish ? (
          <div className="absolute right-0 bottom-full z-10 mb-1 flex flex-col items-end gap-0.5 whitespace-nowrap">
            {justPublished ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sent to crew app
              </span>
            ) : justUnpublished ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Undo2 className="h-3.5 w-3.5" />
                Removed from crew app
              </span>
            ) : published ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  On crew app · {publishedLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setUnpublishConfirmOpen(true)}
                  className="text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                >
                  Remove from crew app
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        <DispatchDayRequirementsBar />
        <Button
          type="button"
          size="sm"
          variant={canPublish ? "primary" : "secondary"}
          disabled={!canPublish}
          onClick={() => setConfirmOpen(true)}
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
              {published ? "Update crew app schedule?" : "Send schedule to crew app?"}
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
                {published ? "Update crew app" : "Send to crew app"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={unpublishConfirmOpen}
        onClose={() => setUnpublishConfirmOpen(false)}
        onConfirm={handleUnpublish}
        title="Remove schedule from crew app?"
        description={`This day's published schedule (${jobCount} job${jobCount === 1 ? "" : "s"}) will no longer appear on crew phones. You can send it again when you're ready.`}
        confirmLabel="Remove from crew app"
        variant="danger"
      />
    </>
  );
}
