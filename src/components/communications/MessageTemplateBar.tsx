"use client";

import {
  draftMessageWithAi,
  fillEmailTemplate,
  fillMessageTemplate,
  getMessageTemplates,
  MESSAGE_TEMPLATES_UPDATED_EVENT,
  type MessageChannel,
  type MessageTemplateCategory,
  type MessageTemplateContext,
} from "@/lib/communications/message-templates";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MessageTemplateBarProps = {
  channel: MessageChannel;
  context: MessageTemplateContext;
  /** Defaults to sales quick replies. */
  category?: MessageTemplateCategory;
  onApply: (text: string) => void;
  /** When set, email templates also fill the subject line. */
  onApplyEmail?: (payload: { subject: string; body: string }) => void;
  className?: string;
};

export function MessageTemplateBar({
  channel,
  context,
  category = "sales",
  onApply,
  onApplyEmail,
  className,
}: MessageTemplateBarProps) {
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    function refresh() {
      setRevision((n) => n + 1);
    }
    window.addEventListener(MESSAGE_TEMPLATES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MESSAGE_TEMPLATES_UPDATED_EVENT, refresh);
  }, []);

  const templates = useMemo(
    () =>
      getMessageTemplates().filter(
        (t) => t.channel === channel && (t.category ?? "sales") === category,
      ),
    [channel, category, revision],
  );

  function applyTemplate(id: string) {
    setSelectedId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    if (channel === "email" && onApplyEmail) {
      const filled = fillEmailTemplate(template, context);
      onApplyEmail(filled);
      onApply(filled.body);
      return;
    }

    onApply(fillMessageTemplate(template, context));
  }

  function draftWithAi() {
    setAiLoading(true);
    window.setTimeout(() => {
      const body = draftMessageWithAi(channel, context);
      if (channel === "email" && onApplyEmail) {
        onApplyEmail({
          subject: `Message from ${context.companyName ?? "Jonah's Movers"}`,
          body,
        });
      }
      onApply(body);
      setSelectedId("");
      setAiLoading(false);
    }, 650);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <select
        value={selectedId}
        onChange={(e) => applyTemplate(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
      >
        <option value="">Use a template…</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={draftWithAi}
        disabled={aiLoading}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-900 hover:bg-violet-100 disabled:opacity-60"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {aiLoading ? "Drafting…" : "Draft with AI"}
      </button>
    </div>
  );
}
