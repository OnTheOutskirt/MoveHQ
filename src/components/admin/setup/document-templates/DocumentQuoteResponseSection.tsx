"use client";

import { QuoteBookingConfirmation } from "@/components/admin/setup/document-templates/QuoteBookingConfirmation";
import { buildCustomerPortalHomePath, isStaffPortalPreview } from "@/lib/moves/customer-portal-home";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarClock, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const NOT_READY_REASONS = [
  "Need to confirm move date",
  "Comparing other quotes",
  "Waiting on lease / closing",
  "Need spouse or partner approval",
  "Still packing / not ready to commit",
  "Other",
];

const DECLINE_REASONS = [
  "Found another mover",
  "Price is too high",
  "Timing doesn't work",
  "Move cancelled or postponed",
  "Scope changed — need new quote",
  "Other",
];

type ResponseMode = "not-ready" | "decline" | null;

type DocumentQuoteResponseSectionProps = {
  accentColor: string;
  moveDate?: string;
  moveReference?: string;
  companyName?: string;
  interactive?: boolean;
  moveId?: string;
  bookingCardChargeAcknowledgment?: string;
  onBookMove?: () => void;
};

export function DocumentQuoteResponseSection({
  accentColor,
  moveDate,
  moveReference,
  interactive = true,
  moveId,
  bookingCardChargeAcknowledgment,
  onBookMove,
}: DocumentQuoteResponseSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffPreview = isStaffPortalPreview(searchParams);
  const portalHomeHref = moveId
    ? buildCustomerPortalHomePath(moveId, { staffPreview })
    : undefined;
  const [mode, setMode] = useState<ResponseMode>(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [cardChargeAcknowledged, setCardChargeAcknowledged] = useState(false);

  const requiresCardAck = Boolean(bookingCardChargeAcknowledgment?.trim());
  const canBook = !requiresCardAck || cardChargeAcknowledged;

  function goToBookingRequested() {
    if (!interactive || !canBook) return;
    onBookMove?.();
    const params = new URLSearchParams();
    if (moveId) params.set("move", moveId);
    if (moveDate) params.set("moveDate", moveDate);
    if (moveReference) params.set("ref", moveReference);
    if (isStaffPortalPreview(searchParams)) params.set("staff", "1");
    router.push(`/portal/quote/booking-requested?${params.toString()}`);
  }

  function submit(label: string) {
    if (!interactive) return;
    if (!reason.trim()) return;
    setSubmitted(`${label}: ${reason}`);
    setMode(null);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-5 text-center">
        <p className="text-sm font-semibold text-emerald-900">Thanks — we got your response</p>
        <p className="mt-1 text-xs text-emerald-800">{submitted}</p>
        <p className="mt-3 text-[11px] text-emerald-700">
          Our team will follow up shortly. Questions? Call or email anytime.
        </p>
        {portalHomeHref ? (
          <Link
            href={portalHomeHref}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Return to your portal
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requiresCardAck ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
          <input
            type="checkbox"
            checked={cardChargeAcknowledged}
            onChange={(e) => setCardChargeAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span className="text-xs leading-relaxed text-slate-700">
            {bookingCardChargeAcknowledgment}
          </span>
        </label>
      ) : null}

      <button
        type="button"
        onClick={goToBookingRequested}
        disabled={!canBook}
        className={cn(
          "group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={{
          backgroundColor: accentColor,
          boxShadow: canBook
            ? `0 8px 24px -8px color-mix(in srgb, ${accentColor} 55%, transparent)`
            : undefined,
        }}
      >
        I&apos;d like to book this move
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>

      <div className="grid gap-2 sm:grid-cols-2">
        <SecondaryAction
          icon={CalendarClock}
          label="Interested but not ready yet"
          active={mode === "not-ready"}
          onClick={() => setMode(mode === "not-ready" ? null : "not-ready")}
        />
        <SecondaryAction
          icon={ThumbsDown}
          label="I don't want to book"
          active={mode === "decline"}
          onClick={() => setMode(mode === "decline" ? null : "decline")}
        />
      </div>

      {mode === "not-ready" ? (
        <ReasonPicker
          title="What's holding you back?"
          reasons={NOT_READY_REASONS}
          reason={reason}
          onReasonChange={setReason}
          onSubmit={() => submit("Interested — follow up")}
          accentColor={accentColor}
          submitLabel="Send — we'll check in"
        />
      ) : null}

      {mode === "decline" ? (
        <ReasonPicker
          title="Help us understand (optional but appreciated)"
          reasons={DECLINE_REASONS}
          reason={reason}
          onReasonChange={setReason}
          onSubmit={() => submit("Declined")}
          accentColor={accentColor}
          submitLabel="Submit response"
        />
      ) : null}

      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        No pressure — we&apos;re here when you&apos;re ready
      </p>
    </div>
  );
}

function SecondaryAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof CalendarClock;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
        active
          ? "border-slate-400 bg-slate-50 text-slate-900"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function ReasonPicker({
  title,
  reasons,
  reason,
  onReasonChange,
  onSubmit,
  accentColor,
  submitLabel,
}: {
  title: string;
  reasons: string[];
  reason: string;
  onReasonChange: (v: string) => void;
  onSubmit: () => void;
  accentColor: string;
  submitLabel: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <select
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
      >
        <option value="">Select a reason…</option>
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!reason}
        onClick={onSubmit}
        className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        style={{ backgroundColor: accentColor }}
      >
        {submitLabel}
      </button>
    </div>
  );
}
