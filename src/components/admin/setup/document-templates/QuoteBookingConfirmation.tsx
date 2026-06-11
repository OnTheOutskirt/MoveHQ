"use client";

import { DEFAULT_DOCUMENT_CONTACT } from "@/lib/settings/document-preview";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import Link from "next/link";

type QuoteBookingConfirmationProps = {
  accentColor: string;
  companyName: string;
  moveDate?: string;
  moveReference?: string;
  quoteHref?: string;
};

export function QuoteBookingConfirmation({
  accentColor,
  companyName,
  moveDate,
  moveReference,
  quoteHref,
}: QuoteBookingConfirmationProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
      <div
        className="px-5 py-6 text-center text-white"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 85%, #0f172a) 0%, ${accentColor} 100%)`,
        }}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-3 text-lg font-bold tracking-tight">Request received!</h2>
        <p className="mt-1 text-sm text-white/85">We&apos;ve notified {companyName} staff.</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <p className="text-sm leading-relaxed text-slate-700">
          Our team is reviewing your request
          {moveDate ? (
            <>
              {" "}
              for <strong>{moveDate}</strong>
            </>
          ) : null}
          . If your date is still available, we&apos;ll send over a contract for you to review and
          sign — that&apos;s when you&apos;ll submit your deposit.
        </p>

        {moveReference ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Reference: <strong>{moveReference}</strong>
          </p>
        ) : null}

        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            What happens next
          </p>
          <ol className="mt-2 space-y-2 text-xs leading-relaxed text-slate-700">
            <li>1. We check crew and truck availability for your date.</li>
            <li>2. You&apos;ll get an email with a contract link if we can hold the date.</li>
            <li>3. Sign the agreement and pay your deposit to secure your move.</li>
          </ol>
        </div>

        {quoteHref ? (
          <Link
            href={quoteHref}
            className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            View quote details
          </Link>
        ) : null}

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          <p className="font-medium text-slate-800">Questions in the meantime?</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${DEFAULT_DOCUMENT_CONTACT.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1 hover:text-brand-700"
            >
              <Phone className="h-3 w-3" />
              {DEFAULT_DOCUMENT_CONTACT.phone}
            </a>
            <a
              href={`mailto:${DEFAULT_DOCUMENT_CONTACT.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-700"
            >
              <Mail className="h-3 w-3" />
              {DEFAULT_DOCUMENT_CONTACT.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
