"use client";

import { DocumentPortalFooter } from "@/components/admin/setup/document-templates/DocumentPortalFooter";
import { DEFAULT_DOCUMENT_CONTACT } from "@/lib/settings/document-preview";
import type { PortalPreviewViewport } from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileSignature,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type DocumentContractCheckoutProps = {
  vars: Record<string, string>;
  accentColor: string;
  logoDataUrl: string | null;
  companyName: string;
  compact?: boolean;
  framed?: boolean;
  viewport?: PortalPreviewViewport;
  interactive?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
};

export function DocumentContractCheckout({
  vars,
  accentColor,
  logoDataUrl,
  companyName,
  compact,
  framed = false,
  viewport = "mobile",
  interactive = true,
  onComplete,
  onBack,
}: DocumentContractCheckoutProps) {
  const [signerName, setSignerName] = useState(vars.shipper_name || vars.customer_name || "");
  const [signed, setSigned] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [processing, setProcessing] = useState(false);

  const canPay =
    signed &&
    signerName.trim().length > 0 &&
    cardNumber.replace(/\s/g, "").length >= 15 &&
    expiry.length >= 4 &&
    cvc.length >= 3 &&
    nameOnCard.trim().length > 0;

  function formatCardInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatExpiryInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function handlePay() {
    if (!interactive || !canPay || processing) return;
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      onComplete?.();
    }, 900);
  }

  return (
    <article className={checkoutArticleClass({ compact, framed, viewport })}>
      <header
        className="relative overflow-hidden px-6 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
        }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to agreement
          </button>
        ) : null}

        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm">
              <Image src={logoDataUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {companyName}
            </p>
            <h1 className="text-lg font-bold tracking-tight">Sign &amp; pay deposit</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-white/85">
          Secure your move date with your deposit. Your card will be saved for the remaining balance
          after your move.
        </p>
      </header>

      <div className="space-y-5 px-5 py-6 sm:px-6">
        <section
          className="rounded-xl px-4 py-3.5 text-sm"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 7%, white)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 22%, white)`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Deposit due today
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                {vars.deposit_amount}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="flex items-center justify-end gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {vars.move_date}
              </p>
              <p className="mt-1">{vars.move_reference}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Balance of <strong className="tabular-nums">{vars.balance_due}</strong> due on completion
            — charged to this card after your move.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <FileSignature className="h-3.5 w-3.5" />
            Your signature
          </p>
          <label className="mt-3 block text-xs font-medium text-slate-600">Full legal name</label>
          <input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            disabled={!interactive}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="As it appears on the agreement"
          />
          <button
            type="button"
            disabled={!interactive || !signerName.trim()}
            onClick={() => interactive && setSigned(true)}
            className={cn(
              "mt-3 flex h-24 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
              signed
                ? "border-emerald-300 bg-emerald-50/60"
                : "border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/30",
            )}
          >
            {signed ? (
              <>
                <p className="font-serif text-2xl italic text-slate-800">{signerName.trim()}</p>
                <p className="mt-1 text-[10px] font-medium text-emerald-700">Signed</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Tap to sign</p>
            )}
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <CreditCard className="h-3.5 w-3.5" />
            Payment details
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Enter your card — this is your first payment with us. Stripe connects at go-live.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Card number</label>
              <div className="relative mt-1">
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                  disabled={!interactive}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-10 text-sm tabular-nums"
                />
                <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Expiry</label>
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                  disabled={!interactive}
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">CVC</label>
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  disabled={!interactive}
                  placeholder="123"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Name on card</label>
              <input
                autoComplete="cc-name"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                disabled={!interactive}
                placeholder="Full name"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
              Your card will be saved securely for the remaining balance after your move.
            </p>
          </div>
        </section>

        <button
          type="button"
          disabled={!canPay || processing || !interactive}
          onClick={handlePay}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition",
            !canPay || processing
              ? "cursor-not-allowed bg-slate-300 shadow-none"
              : "hover:brightness-105 active:scale-[0.99]",
          )}
          style={
            canPay && !processing
              ? {
                  backgroundColor: accentColor,
                  boxShadow: `0 8px 24px -8px color-mix(in srgb, ${accentColor} 55%, transparent)`,
                }
              : undefined
          }
        >
          <Lock className="h-4 w-4" />
          {processing ? "Processing…" : `Pay ${vars.deposit_amount} & book my move`}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Encrypted checkout · Powered by Stripe at go-live
        </p>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          Questions? {DEFAULT_DOCUMENT_CONTACT.phone} · {DEFAULT_DOCUMENT_CONTACT.email}
        </p>
      </div>

      <DocumentPortalFooter accentColor={accentColor} />
    </article>
  );
}

function checkoutArticleClass({
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
