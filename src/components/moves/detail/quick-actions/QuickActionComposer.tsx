"use client";

import { EmailComposeBody } from "@/components/communications/EmailComposeBody";
import { useEmailDraft } from "@/components/communications/EmailDraftProvider";
import { MessageTemplateBar } from "@/components/communications/MessageTemplateBar";
import { Button } from "@/components/ui/Button";
import {
  buildMessageTemplateContextFromMove,
  type MessageTemplateContext,
} from "@/lib/communications/message-templates";
import type { MoveQuickActionId } from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";
import { useState } from "react";

type QuickActionComposerProps = {
  action: MoveQuickActionId;
  move: MoveRecord;
};

export function QuickActionComposer({ action, move }: QuickActionComposerProps) {
  const templateContext = buildMessageTemplateContextFromMove(move);

  switch (action) {
    case "call":
      return <CallQuickActionComposer move={move} templateContext={templateContext} />;
    case "sms":
      return <SmsQuickActionComposer move={move} templateContext={templateContext} />;
    case "email":
      return <EmailQuickActionComposer move={move} templateContext={templateContext} />;
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
      return <CheckQuoteComposer templateContext={templateContext} />;
    case "send-reminder":
      return <SendReminderComposer templateContext={templateContext} />;
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
      return <ConfirmMoveComposer templateContext={templateContext} />;
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

function CallQuickActionComposer({
  move,
  templateContext,
}: {
  move: MoveRecord;
  templateContext: MessageTemplateContext;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-3">
      <MessageTemplateBar channel="call" context={templateContext} onApply={setNotes} />
      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Call notes
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Outcome, voicemail, callback time…"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <Button type="button" disabled title="Coming soon" className="w-full">
        Log call
      </Button>
    </div>
  );
}

function SmsQuickActionComposer({
  move,
  templateContext,
}: {
  move: MoveRecord;
  templateContext: MessageTemplateContext;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        To <span className="font-medium text-slate-800">{move.customerPhone || "—"}</span>
      </p>
      <MessageTemplateBar channel="sms" context={templateContext} onApply={setMessage} />
      <label className="block text-sm">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <Button type="button" disabled title="Coming soon" className="w-full">
        Send SMS
      </Button>
    </div>
  );
}

function EmailQuickActionComposer({
  move,
  templateContext,
}: {
  move: MoveRecord;
  templateContext: MessageTemplateContext;
}) {
  const { subject, setSubject, body, setBody } = useEmailDraft();

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        To <span className="font-medium text-slate-800">{move.customerEmail || "—"}</span>
      </p>
      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Subject
        </span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <MessageTemplateBar
        channel="email"
        context={templateContext}
        onApply={setBody}
        onApplyEmail={({ subject: nextSubject, body: nextBody }) => {
          setSubject(nextSubject);
          setBody(nextBody);
        }}
      />
      <EmailComposeBody value={body} onChange={setBody} rows={4} showSignaturePreview={false} />
      <Button type="button" disabled title="Coming soon" className="w-full">
        Send email
      </Button>
    </div>
  );
}

function CheckQuoteComposer({ templateContext }: { templateContext: MessageTemplateContext }) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      <MessageTemplateBar channel="call" context={templateContext} onApply={setNotes} />
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Quick check-in about the estimate — questions, timeline, revisions…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
      />
      <MessageTemplateBar channel="sms" context={templateContext} onApply={setMessage} />
      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional SMS follow-up…"
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
}

function SendReminderComposer({ templateContext }: { templateContext: MessageTemplateContext }) {
  const [message, setMessage] = useState(
    "Hi — just following up on the estimate we sent. Let us know if you have questions!",
  );

  return (
    <div className="space-y-3">
      <MessageTemplateBar channel="sms" context={templateContext} onApply={setMessage} />
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
      />
      <Button type="button" disabled title="Coming soon" className="w-full">
        Send reminder
      </Button>
    </div>
  );
}

function ConfirmMoveComposer({ templateContext }: { templateContext: MessageTemplateContext }) {
  const [message, setMessage] = useState(
    "Confirm crew arrival window and any access notes for move day.",
  );

  return (
    <div className="space-y-3">
      <MessageTemplateBar channel="sms" context={templateContext} onApply={setMessage} />
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Arrival window, parking, point of contact…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
      />
      <Button type="button" disabled title="Coming soon" className="w-full">
        Send confirmation
      </Button>
    </div>
  );
}
