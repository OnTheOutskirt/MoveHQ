"use client";

import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import {
  formatWalkthroughMode,
  formatWalkthroughScheduleLine,
  resolveMoveWalkthrough,
} from "@/lib/moves/walkthroughs";
import { CalendarClock, CheckCircle2, MapPin, Video, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type WalkthroughCancelPortalProps = {
  move: MoveRecord;
  companyName: string;
  accentColor: string;
  companyPhone?: string;
  schedulingPath?: string;
};

export function WalkthroughCancelPortal({
  move,
  companyName,
  accentColor,
  companyPhone,
  schedulingPath,
}: WalkthroughCancelPortalProps) {
  const { cancelWalkthrough } = useMovesActions();
  const walkthrough = resolveMoveWalkthrough(move);
  const [cancelled, setCancelled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (cancelled) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
        <header
          className="px-6 py-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-200" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Walkthrough cancelled</h1>
          <p className="mt-2 text-sm text-white/85">
            {companyName} has been notified. You can schedule a new time anytime.
          </p>
        </header>
        <div className="space-y-4 px-5 py-6">
          {schedulingPath ? (
            <Link
              href={schedulingPath}
              className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              Schedule a new walkthrough
            </Link>
          ) : null}
          {companyPhone ? (
            <p className="text-center text-sm text-slate-600">
              Questions? Call{" "}
              <a href={`tel:${companyPhone}`} className="font-medium text-brand-700 hover:underline">
                {companyPhone}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!walkthrough || walkthrough.status !== "scheduled") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <XCircle className="h-10 w-10 text-slate-300" />
        <p className="mt-4 text-lg font-semibold text-slate-900">No walkthrough to cancel</p>
        <p className="mt-2 text-sm text-slate-500">
          This walkthrough is not scheduled or was already cancelled. Contact {companyName} if you
          need help.
        </p>
        {companyPhone ? (
          <a
            href={`tel:${companyPhone}`}
            className="mt-4 text-sm font-medium text-brand-600 hover:underline"
          >
            {companyPhone}
          </a>
        ) : null}
      </div>
    );
  }

  const ModeIcon = walkthrough.mode === "virtual" ? Video : MapPin;

  function handleCancel() {
    cancelWalkthrough(move.id, {
      cancelledBy: "customer",
      actor: `${move.customerName} (cancel link)`,
    });
    setConfirmOpen(false);
    setCancelled(true);
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
      <header
        className="px-6 py-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
        }}
      >
        <CalendarClock className="h-9 w-9 text-white/90" />
        <h1 className="mt-3 text-xl font-bold tracking-tight">Cancel walkthrough</h1>
        <p className="mt-2 text-sm text-white/85">
          {move.reference} · {move.customerName}
        </p>
      </header>

      <div className="space-y-5 px-5 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm">
          <p className="font-semibold text-slate-900">
            {formatWalkthroughScheduleLine(walkthrough)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-slate-700">
            <ModeIcon className="h-3.5 w-3.5 shrink-0" />
            {formatWalkthroughMode(walkthrough.mode)} with {walkthrough.assignedTo}
          </p>
          {walkthrough.location ? (
            <p className="mt-1 text-slate-600">{walkthrough.location}</p>
          ) : null}
        </div>

        {confirmOpen ? (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-4">
            <p className="text-sm font-medium text-red-950">Cancel this walkthrough?</p>
            <p className="mt-1 text-sm text-red-900/90">
              {formatMoveDate(walkthrough.scheduledDate)} at {walkthrough.startTime} with{" "}
              {walkthrough.assignedTo} will be removed from the calendar.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="danger" size="sm" onClick={handleCancel}>
                Yes, cancel walkthrough
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
                Keep appointment
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>
            Cancel walkthrough
          </Button>
        )}

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          Prefer to reschedule instead? Contact {companyName}
          {companyPhone ? ` at ${companyPhone}` : ""} or use your scheduling link.
        </p>
      </div>
    </div>
  );
}
