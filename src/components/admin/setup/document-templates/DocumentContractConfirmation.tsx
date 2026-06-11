"use client";

import { DocumentPortalFooter } from "@/components/admin/setup/document-templates/DocumentPortalFooter";
import { DEFAULT_DOCUMENT_CONTACT } from "@/lib/settings/document-preview";
import type { PortalPreviewViewport } from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Mail,
  Phone,
  Shield,
  Truck,
} from "lucide-react";
import Image from "next/image";

type DocumentContractConfirmationProps = {
  vars: Record<string, string>;
  accentColor: string;
  logoDataUrl: string | null;
  companyName: string;
  compact?: boolean;
  framed?: boolean;
  viewport?: PortalPreviewViewport;
};

export function DocumentContractConfirmation({
  vars,
  accentColor,
  logoDataUrl,
  companyName,
  compact,
  framed = false,
  viewport = "mobile",
}: DocumentContractConfirmationProps) {
  const phone = vars.company_phone || DEFAULT_DOCUMENT_CONTACT.phone;
  const email = vars.company_email || DEFAULT_DOCUMENT_CONTACT.email;

  return (
    <article className={confirmationArticleClass({ compact, framed, viewport })}>
      <header
        className="relative overflow-hidden px-6 py-8 text-center text-white"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 88%, #0f172a) 0%, ${accentColor} 50%, color-mix(in srgb, ${accentColor} 55%, #0f172a) 100%)`,
        }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">You&apos;re all set!</h1>
        <p className="mt-2 text-sm text-white/85">
          Agreement signed and deposit received — your move is on the calendar.
        </p>
      </header>

      <div className="space-y-5 px-5 py-6 sm:px-6">
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Deposit paid today
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-950">
            {vars.deposit_amount}
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            Applied toward your move · Receipt emailed to you
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <CreditCard className="h-3.5 w-3.5" />
            Card on file (Stripe)
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex h-10 w-14 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              VISA
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">•••• •••• •••• 4242</p>
              <p className="text-xs text-slate-500">Saved securely for balance due after your move</p>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-700">
            When your move is complete, we&apos;ll charge the remaining balance of{" "}
            <strong className="tabular-nums">{vars.balance_due}</strong> to this card. You&apos;ll
            receive a receipt and can update your payment method by contacting us before move day.
          </p>
        </section>

        <section className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Your move
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <UsersIcon />
              <div>
                <dt className="text-[10px] text-slate-500">Shipper</dt>
                <dd className="font-medium text-slate-900">{vars.shipper_name || vars.customer_name}</dd>
              </div>
            </div>
            <div className="flex gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-[10px] text-slate-500">Move date</dt>
                <dd className="font-medium text-slate-900">
                  {vars.move_date}
                  {vars.arrival_window ? ` · ${vars.arrival_window}` : ""}
                </dd>
              </div>
            </div>
            <div className="flex gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-[10px] text-slate-500">Reference</dt>
                <dd className="font-medium text-slate-900">{vars.move_reference}</dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 px-4 py-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            What happens next
          </p>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="font-semibold text-slate-400">1.</span>
              We&apos;ll confirm your arrival window the day before your move.
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-slate-400">2.</span>
              Your crew lead will walk through scope and pricing before work begins.
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-slate-400">3.</span>
              After completion, your card on file is charged the remaining balance.
            </li>
          </ol>
        </section>

        <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          {logoDataUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image src={logoDataUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : null}
          <p className="font-semibold text-slate-800">{companyName}</p>
          <p className="flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1 hover:text-brand-700">
              <Phone className="h-3 w-3" />
              {phone}
            </a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:text-brand-700">
              <Mail className="h-3 w-3" />
              {email}
            </a>
          </p>
        </div>
      </div>

      <DocumentPortalFooter accentColor={accentColor} />
    </article>
  );
}

function confirmationArticleClass({
  compact,
  framed,
  viewport,
}: {
  compact?: boolean;
  framed?: boolean;
  viewport: PortalPreviewViewport;
}): string {
  if (framed) {
    return "w-full overflow-hidden bg-white";
  }
  if (compact) {
    return "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm";
  }
  if (viewport === "desktop") {
    return "mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50";
  }
  return "mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50";
}

function UsersIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
