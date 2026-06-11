"use client";

import { EmailComposeBody } from "@/components/communications/EmailComposeBody";
import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  walkthroughShareActivityLabel,
  walkthroughShareEmailBody,
  walkthroughShareEmailSubject,
  walkthroughShareSmsBody,
  type WalkthroughShareKind,
} from "@/lib/moves/walkthrough-meeting-links";
import { WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT } from "@/lib/communications/walkthrough-share-templates";
import type { MoveRecord } from "@/lib/moves/types";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type WalkthroughComposeChannel = "email" | "sms";

type WalkthroughMessageComposeProps = {
  channel: WalkthroughComposeChannel;
  kind: WalkthroughShareKind;
  move: MoveRecord;
  linkUrl: string;
  assignee?: string;
  slotLabel?: string;
  onClose: () => void;
};

export function WalkthroughMessageCompose({
  channel,
  kind,
  move,
  linkUrl,
  assignee,
  slotLabel,
  onClose,
}: WalkthroughMessageComposeProps) {
  const { recordWalkthroughLinkSent } = useMovesActions();
  const [templateRevision, setTemplateRevision] = useState(0);
  const defaults = useMemo(
    () => ({
      subject: walkthroughShareEmailSubject(kind, move, linkUrl, assignee, slotLabel),
      body:
        channel === "email"
          ? walkthroughShareEmailBody(kind, move, linkUrl, assignee, slotLabel)
          : walkthroughShareSmsBody(kind, move, linkUrl, assignee, slotLabel),
    }),
    [kind, move, linkUrl, assignee, slotLabel, channel, templateRevision],
  );
  const [subject, setSubject] = useState(defaults.subject);
  const [body, setBody] = useState(defaults.body);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function onTemplatesUpdated() {
      setTemplateRevision((n) => n + 1);
    }
    window.addEventListener(WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT, onTemplatesUpdated);
    return () =>
      window.removeEventListener(WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT, onTemplatesUpdated);
  }, []);

  useEffect(() => {
    setSubject(defaults.subject);
    setBody(defaults.body);
    setSent(false);
  }, [defaults.subject, defaults.body, channel, kind]);

  const activityLabel = walkthroughShareActivityLabel(kind);
  const toLabel =
    channel === "email"
      ? move.customerEmail?.trim() || "No email on file"
      : move.customerPhone?.trim() || "No phone on file";

  function handleSend() {
    recordWalkthroughLinkSent(
      move.id,
      assignee ?? "",
      linkUrl,
      `${activityLabel} (${channel})`,
    );
    setSent(true);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to walkthrough
      </button>

      <p className="text-xs text-slate-500">
        To <span className="font-medium text-slate-800">{toLabel}</span>
      </p>

      {channel === "email" ? (
        <>
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
          <EmailComposeBody
            value={body}
            onChange={setBody}
            rows={4}
            showSignaturePreview
          />
        </>
      ) : (
        <label className="block text-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Message
          </span>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            {body.length} characters
            {body.length > 160 ? " · may split into multiple SMS segments" : ""}
          </p>
        </label>
      )}

      {sent ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          {activityLabel} logged on the move. Twilio / Outlook will send for real when integrations
          are live.
        </p>
      ) : (
        <Button
          type="button"
          className="w-full"
          disabled={!body.trim() || (channel === "email" && !move.customerEmail?.trim())}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
          Send {channel === "email" ? "email" : "SMS"}
        </Button>
      )}
    </div>
  );
}
