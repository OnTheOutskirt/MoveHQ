"use client";

import { Button } from "@/components/ui/Button";
import type { MoveQuickActionId } from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";

type QuickActionComposerProps = {
  action: MoveQuickActionId;
  move: MoveRecord;
};

export function QuickActionComposer({ action, move }: QuickActionComposerProps) {
  switch (action) {
    case "call":
      return (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Call notes
            </span>
            <textarea
              rows={3}
              placeholder="Outcome, voicemail, callback time…"
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled title="Coming soon" className="flex-1">
              Log call
            </Button>
            {move.customerPhone ? (
              <a
                href={`tel:${move.customerPhone}`}
                className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dial {move.customerPhone}
              </a>
            ) : null}
          </div>
        </div>
      );

    case "sms":
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            To <span className="font-medium text-slate-800">{move.customerPhone || "—"}</span>
          </p>
          <label className="block text-sm">
            <textarea
              rows={3}
              placeholder="Write a message…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send SMS
          </Button>
        </div>
      );

    case "email":
      return (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </span>
            <input
              type="text"
              defaultValue={`Your move estimate — ${move.reference}`}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block text-sm">
            <textarea
              rows={3}
              placeholder="Write your email…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send email
          </Button>
        </div>
      );

    case "note":
      return (
        <div className="space-y-3">
          <label className="block text-sm">
            <textarea
              rows={3}
              placeholder="Internal note on this move…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Save note
          </Button>
        </div>
      );

    case "follow-up":
      return (
        <div className="space-y-3">
          <label className="block text-sm">
            <input
              type="text"
              defaultValue="Call back on proposal"
              placeholder="What to do…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm"
            />
            <select className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm">
              <option value="call">Call</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Schedule follow-up
          </Button>
        </div>
      );

    case "check-quote":
      return (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder="Quick check-in about the estimate — questions, timeline, revisions…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" disabled title="Coming soon" variant="secondary" className="w-full">
              Log call attempt
            </Button>
            <Button type="button" disabled title="Coming soon" className="w-full">
              Send check-in
            </Button>
          </div>
        </div>
      );

    case "send-reminder":
      return (
        <div className="space-y-3">
          <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <option>Quote expiring soon</option>
            <option>Gentle nudge — any questions?</option>
            <option>Ready to book?</option>
          </select>
          <textarea
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            defaultValue="Hi — just following up on the estimate we sent. Let us know if you have questions!"
          />
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send reminder
          </Button>
        </div>
      );

    case "collect-deposit":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-500">Deposit due</p>
              <p className="font-semibold text-slate-900">$500.00</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-500">Received</p>
              <p className="font-semibold text-slate-900">$0.00</p>
            </div>
          </div>
          <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option>Card (payment link)</option>
            <option>Check</option>
            <option>Cash</option>
          </select>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Record deposit
          </Button>
        </div>
      );

    case "send-contract":
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            E-sign packet for {move.customerName} · {move.customerEmail || "no email on file"}
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
            Include estimate &amp; valuation summary
          </label>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send contract
          </Button>
        </div>
      );

    case "confirm-move":
      return (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder="Arrival window, parking, point of contact…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            defaultValue="Confirm crew arrival window and any access notes for move day."
          />
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send confirmation
          </Button>
        </div>
      );

    case "ops-handoff":
      return (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder="Special items, elevator, COI, parking…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
          <Button type="button" disabled title="Coming soon" className="w-full">
            Post to operations
          </Button>
        </div>
      );

    case "collect-payment":
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-sm">
            <p className="text-[10px] font-semibold uppercase text-emerald-800">Balance due</p>
            <p className="text-lg font-semibold text-emerald-900">$1,240.00</p>
          </div>
          <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option>Card</option>
            <option>ACH</option>
            <option>Check</option>
          </select>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Record payment
          </Button>
        </div>
      );

    case "final-invoice":
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Generate and email final invoice with line items from the booked estimate.
          </p>
          <Button type="button" disabled title="Coming soon" className="w-full">
            Send final invoice
          </Button>
        </div>
      );

    case "book-walkthrough":
      return null;

    default:
      return null;
  }
}
