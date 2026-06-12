"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  cardNumberLast4,
  formatCardNumberInput,
  formatExpiryInput,
  isExpiryValid,
  type ManualPhonePaymentPurpose,
} from "@/lib/moves/manual-phone-payment";
import type { MoveDepositSummary } from "@/lib/moves/move-deposit";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CreditCard, Lock, Phone } from "lucide-react";
import { useMemo, useState } from "react";

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type ManualPhonePaymentPanelProps = {
  move: MoveRecord;
  deposit: MoveDepositSummary;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ManualPhonePaymentPanel({ move, deposit }: ManualPhonePaymentPanelProps) {
  const { recordManualPhonePayment } = useMoves();
  const [purpose, setPurpose] = useState<ManualPhonePaymentPurpose>("deposit");
  const [amount, setAmount] = useState(String(deposit.depositDue || ""));
  const [cardholderName, setCardholderName] = useState(move.customerName);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amountPresets = useMemo(
    () =>
      [
        { id: "deposit" as const, label: "Deposit", value: deposit.depositDue },
        { id: "balance" as const, label: "Balance", value: deposit.balanceDue },
      ].filter((preset) => preset.value > 0),
    [deposit.balanceDue, deposit.depositDue],
  );

  function applyPreset(nextPurpose: ManualPhonePaymentPurpose, value: number) {
    setPurpose(nextPurpose);
    setAmount(String(value));
    setSuccess(null);
    setError(null);
  }

  const parsedAmount = Number.parseFloat(amount.replace(/,/g, ""));
  const digits = cardNumber.replace(/\D/g, "");
  const canSubmit =
    parsedAmount > 0 &&
    cardholderName.trim().length > 0 &&
    digits.length >= 13 &&
    isExpiryValid(expiry) &&
    cvc.replace(/\D/g, "").length >= 3 &&
    billingZip.trim().length >= 5 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      recordManualPhonePayment(move.id, {
        amount: Math.round(parsedAmount * 100) / 100,
        purpose,
        cardholderName: cardholderName.trim(),
        last4: cardNumberLast4(cardNumber),
        note: note.trim() || undefined,
      });
      setSuccess(
        `${formatMoney(parsedAmount)} charged to card ending ${cardNumberLast4(cardNumber)}.`,
      );
      setCardNumber("");
      setExpiry("");
      setCvc("");
      setBillingZip("");
      setNote("");
    } catch {
      setError("Could not record the payment. Try again or use the customer portal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Phone className="h-4 w-4 text-slate-500" aria-hidden />
              Take payment over the phone
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Enter card details while the customer is on the line. Charges run through Stripe
              Payment Intents (card-not-present) — card data is sent to Stripe only, not stored in
              MoveHQ.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#635bff]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#635bff]">
            Stripe
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Amount
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {amountPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id, preset.value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  purpose === preset.id
                    ? "border-brand-300 bg-brand-50 text-brand-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                )}
              >
                {preset.label} · {formatMoney(preset.value)}
              </button>
            ))}
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <label className="block text-sm">
              <span className="sr-only">Charge amount</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSuccess(null);
                    setError(null);
                  }}
                  className={cn(FIELD_CLASS, "pl-7 tabular-nums")}
                />
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Purpose
              </span>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as ManualPhonePaymentPurpose)}
                className={cn(FIELD_CLASS, "mt-1")}
              >
                <option value="deposit">Deposit</option>
                <option value="balance">Balance due</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CreditCard className="h-3.5 w-3.5" aria-hidden />
            Card details
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Name on card
              </span>
              <input
                type="text"
                autoComplete="cc-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className={cn(FIELD_CLASS, "mt-1")}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Card number
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                className={cn(FIELD_CLASS, "mt-1 font-mono tracking-wide")}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Expiration
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                className={cn(FIELD_CLASS, "mt-1 font-mono")}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                CVC
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={cn(FIELD_CLASS, "mt-1 font-mono")}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Billing ZIP
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="80202"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value)}
                className={cn(FIELD_CLASS, "mt-1 max-w-[10rem]")}
              />
            </label>
          </div>
        </div>

        <label className="block text-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Internal note <span className="font-normal normal-case text-slate-400">(optional)</span>
          </span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Customer authorized charge by phone…"
            className={cn(FIELD_CLASS, "mt-1 resize-none")}
          />
        </label>

        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Demo mode records the charge on the move — connect Stripe in Integrations to process live
            cards.
          </p>
          <Button type="submit" disabled={!canSubmit} className="shrink-0 sm:min-w-[10rem]">
            {submitting ? "Processing…" : "Charge card"}
          </Button>
        </div>
      </form>
    </section>
  );
}
