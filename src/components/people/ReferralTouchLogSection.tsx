"use client";

import { useReferralPartners } from "@/components/providers/ReferralPartnersProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import type { ReferralPartnerType, ReferralTouchType } from "@/lib/referrals/types";
import {
  REFERRAL_TOUCH_TYPE_LABELS,
  REFERRAL_TOUCH_TYPES,
} from "@/lib/referrals/types";
import { Gift, Plus } from "lucide-react";
import { useState } from "react";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type ReferralTouchLogSectionProps = {
  partnerType: ReferralPartnerType;
  partnerId: string;
};

export function ReferralTouchLogSection({
  partnerType,
  partnerId,
}: ReferralTouchLogSectionProps) {
  const { touchesForPartner, addTouch } = useReferralPartners();
  const [touchOpen, setTouchOpen] = useState(false);
  const [touchType, setTouchType] = useState<ReferralTouchType>("thank_you_text");
  const [touchDate, setTouchDate] = useState(new Date().toISOString().slice(0, 10));
  const [touchNotes, setTouchNotes] = useState("");
  const [giftValue, setGiftValue] = useState("");
  const [loggedBy, setLoggedBy] = useState("");

  const touches = touchesForPartner(partnerType, partnerId);

  function resetTouchForm() {
    setTouchType("thank_you_text");
    setTouchDate(new Date().toISOString().slice(0, 10));
    setTouchNotes("");
    setGiftValue("");
    setLoggedBy("");
    setTouchOpen(false);
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Touch log</p>
          <p className="text-xs text-slate-500">
            Thank-you texts, gifts, lunches, and check-in calls.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setTouchOpen((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" />
          Log touch
        </Button>
      </div>

      {touchOpen ? (
        <div className="mb-3 space-y-3 rounded-lg border border-brand-200 bg-brand-50/30 p-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Type</span>
            <select
              value={touchType}
              onChange={(e) => setTouchType(e.target.value as ReferralTouchType)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
            >
              {REFERRAL_TOUCH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {REFERRAL_TOUCH_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Date</span>
              <input
                type="date"
                value={touchDate}
                onChange={(e) => setTouchDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </label>
            {touchType === "gift" ? (
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Gift value ($)</span>
                <input
                  type="number"
                  min={0}
                  value={giftValue}
                  onChange={(e) => setGiftValue(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Logged by</span>
                <input
                  value={loggedBy}
                  onChange={(e) => setLoggedBy(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  placeholder="Your name"
                />
              </label>
            )}
          </div>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Notes</span>
            <textarea
              value={touchNotes}
              onChange={(e) => setTouchNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm leading-relaxed"
              placeholder="What you sent, who you spoke with, gift details…"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={resetTouchForm}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!touchNotes.trim()}
              onClick={() => {
                addTouch({
                  partnerType,
                  partnerId,
                  touchType,
                  date: touchDate,
                  notes: touchNotes.trim(),
                  giftValue: giftValue ? Number(giftValue) : undefined,
                  loggedBy: loggedBy.trim() || undefined,
                });
                resetTouchForm();
              }}
            >
              Save touch
            </Button>
          </div>
        </div>
      ) : null}

      {touches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
          <Gift className="mx-auto h-7 w-7 text-slate-300" />
          <p className="mt-2 text-sm text-slate-600">No touches logged yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {touches.map((touch) => (
            <li
              key={touch.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{REFERRAL_TOUCH_TYPE_LABELS[touch.touchType]}</Badge>
                <span className="text-xs text-slate-500">{formatMoveDate(touch.date)}</span>
                {touch.giftValue != null ? (
                  <span className="text-xs font-medium text-slate-700">
                    {formatMoney(touch.giftValue)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-snug text-slate-700">{touch.notes}</p>
              {touch.loggedBy ? (
                <p className="mt-1 text-[11px] text-slate-400">{touch.loggedBy}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
