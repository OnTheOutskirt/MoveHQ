"use client";

import { EmailComposeBody } from "@/components/communications/EmailComposeBody";
import { useEmailDraft } from "@/components/communications/EmailDraftProvider";
import { MessageTemplateBar } from "@/components/communications/MessageTemplateBar";
import {
  buildMessageTemplateContext,
  type MessageTemplateContext,
} from "@/lib/communications/message-templates";
import { Button } from "@/components/ui/Button";
import type { DirectoryContactChannel } from "@/lib/people/contact-communication-history";
import { useState } from "react";

type DirectoryContactComposerProps = {
  action: DirectoryContactChannel;
  name: string;
  phone?: string | null;
  email?: string | null;
  moveReference?: string;
};

export function DirectoryContactComposer({
  action,
  name,
  phone,
  email,
  moveReference,
}: DirectoryContactComposerProps) {
  const templateContext = buildMessageTemplateContext({
    contactName: name,
    moveReference,
  });

  switch (action) {
    case "call":
      return (
        <DirectoryCallComposer name={name} phone={phone} templateContext={templateContext} />
      );
    case "sms":
      return (
        <DirectorySmsComposer name={name} phone={phone} templateContext={templateContext} />
      );
    case "email":
      return (
        <DirectoryEmailComposer
          name={name}
          email={email}
          moveReference={moveReference}
          templateContext={templateContext}
        />
      );
  }
}

function DirectoryCallComposer({
  phone,
}: {
  name: string;
  phone?: string | null;
  templateContext: MessageTemplateContext;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-3">
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

function DirectorySmsComposer({
  name,
  phone,
  templateContext,
}: {
  name: string;
  phone?: string | null;
  templateContext: MessageTemplateContext;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        To <span className="font-medium text-slate-800">{name}</span>
        {phone ? <span className="text-slate-400"> · {phone}</span> : null}
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

function DirectoryEmailComposer({
  name,
  email,
  moveReference,
  templateContext,
}: {
  name: string;
  email?: string | null;
  moveReference?: string;
  templateContext: MessageTemplateContext;
}) {
  const { subject, setSubject, body, setBody } = useEmailDraft();

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        To <span className="font-medium text-slate-800">{email || "—"}</span>
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
