"use client";

import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  fillEmailTemplate,
  fillMessageTemplate,
  generateMessageTemplateId,
  MESSAGE_TEMPLATE_MERGE_FIELDS,
  resetCategoryTemplates,
  type MessageTemplate,
  type MessageTemplateCategory,
  type MessageTemplateEditorChannel,
} from "@/lib/communications/message-templates";
import { WalkthroughShareTemplatesEditor } from "@/components/admin/setup/WalkthroughShareTemplatesEditor";
import { VendorTemplatesEditor } from "@/components/admin/setup/VendorTemplatesEditor";
import type { WalkthroughShareTemplates } from "@/lib/communications/walkthrough-share-templates";
import type { VendorMessageTemplatesStore } from "@/lib/communications/vendor-message-templates";
import { cn } from "@/lib/utils";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, type ReactNode } from "react";

const SALES_CHANNELS: { id: MessageTemplateEditorChannel; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "call", label: "Call notes" },
];

const OPS_CHANNELS: { id: MessageTemplateEditorChannel; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
];

const PREVIEW_CONTEXT = {
  customerName: "Jamie Chen",
  moveDate: "Jun 15, 2026",
  origin: "Cleveland",
  destination: "Columbus",
  assignedRep: "Alex Rivera",
  companyName: "Jonah's Movers",
  companyPhone: "(555) 201-1001",
  portalLink: "https://movehq.app/portal/move-day?move=demo",
  feedbackLink: "https://movehq.app/portal/move?move=mv-complete",
  reviewLink: "https://g.page/r/jonahs-movers-tomball/review",
};

type MessageSection = "sales" | "ops" | "automations" | "vendors" | "walkthrough";

type MessageTemplatesTabProps = {
  templates: MessageTemplate[];
  onChange: (templates: MessageTemplate[]) => void;
  walkthroughTemplates: WalkthroughShareTemplates;
  onWalkthroughChange: (templates: WalkthroughShareTemplates) => void;
  vendorTemplates: VendorMessageTemplatesStore;
  onVendorTemplatesChange: (templates: VendorMessageTemplatesStore) => void;
};

export function MessageTemplatesTab({
  templates,
  onChange,
  walkthroughTemplates,
  onWalkthroughChange,
  vendorTemplates,
  onVendorTemplatesChange,
}: MessageTemplatesTabProps) {
  const [section, setSection] = useState<MessageSection>("sales");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SectionButton
          active={section === "sales"}
          onClick={() => setSection("sales")}
          label="Sales quick replies"
        />
        <SectionButton
          active={section === "ops"}
          onClick={() => setSection("ops")}
          label="Operations"
        />
        <SectionButton
          active={section === "vendors"}
          onClick={() => setSection("vendors")}
          label="Vendor templates"
        />
        <SectionButton
          active={section === "automations"}
          onClick={() => setSection("automations")}
          label="Automated messages"
        />
        <SectionButton
          active={section === "walkthrough"}
          onClick={() => setSection("walkthrough")}
          label="Walkthrough links"
        />
      </div>

      {section === "walkthrough" ? (
        <WalkthroughShareTemplatesEditor
          templates={walkthroughTemplates}
          onChange={onWalkthroughChange}
        />
      ) : section === "vendors" ? (
        <VendorTemplatesEditor templates={vendorTemplates} onChange={onVendorTemplatesChange} />
      ) : (
        <QuickReplyTemplateEditor
          templates={templates}
          onChange={onChange}
          category={section}
          channels={
            section === "sales"
              ? SALES_CHANNELS
              : section === "automations"
                ? OPS_CHANNELS
                : OPS_CHANNELS
          }
          title={
            section === "sales"
              ? "Sales quick replies"
              : section === "automations"
                ? "Automated messages"
                : "Operations templates"
          }
          description={
            section === "sales" ? (
              "Snippets reps pick in inbox, move quick actions, and directory contact panels."
            ) : section === "automations" ? (
              <>
                SMS and email sent by pipeline automations — quote confirmations, booking emails,
                day-before crew links, crew feedback requests. Turn rules on/off under{" "}
                <Link
                  href="/admin/setup?tab=automations"
                  className="font-medium text-brand-600 hover:underline"
                >
                  Setup → Automations
                </Link>
                .
              </>
            ) : (
              "Manual ops messages — claims, crew on the way, day-before reminders, and move-day notes."
            )
          }
        />
      )}
    </div>
  );
}

function SectionButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 text-slate-700 hover:bg-slate-50",
      )}
    >
      {label}
    </button>
  );
}

function QuickReplyTemplateEditor({
  templates,
  onChange,
  category,
  channels,
  title,
  description,
}: {
  templates: MessageTemplate[];
  onChange: (templates: MessageTemplate[]) => void;
  category: MessageTemplateCategory;
  channels: { id: MessageTemplateEditorChannel; label: string }[];
  title: string;
  description: ReactNode;
}) {
  const [channel, setChannel] = useState<MessageTemplateEditorChannel>(channels[0]?.id ?? "sms");

  const categoryTemplates = useMemo(
    () => templates.filter((t) => (t.category ?? "sales") === category),
    [templates, category],
  );

  const channelTemplates = useMemo(
    () => categoryTemplates.filter((t) => t.channel === channel),
    [categoryTemplates, channel],
  );

  const [activeId, setActiveId] = useState("");

  const active = useMemo(() => {
    const hit = channelTemplates.find((t) => t.id === activeId);
    return hit ?? channelTemplates[0] ?? null;
  }, [channelTemplates, activeId]);

  useEffect(() => {
    const first = categoryTemplates.find((t) => t.channel === channel);
    if (active && channelTemplates.some((t) => t.id === active.id)) return;
    setActiveId(first?.id ?? channelTemplates[0]?.id ?? "");
  }, [channel, categoryTemplates, channelTemplates, active]);

  function patchTemplate(id: string, patch: Partial<MessageTemplate>) {
    onChange(templates.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function addTemplate() {
    const next: MessageTemplate =
      channel === "email"
        ? {
            id: generateMessageTemplateId("email"),
            channel: "email",
            category,
            label:
              category === "automations"
                ? "New automated email"
                : category === "ops"
                  ? "New ops email"
                  : "New email template",
            subject: "Message from {{company}}",
            body: "Hi {{firstName}},\n\n\n\nBest regards,",
          }
        : channel === "call"
          ? {
              id: generateMessageTemplateId("call"),
              channel: "call",
              category: "sales",
              label: "New call note",
              body: "Spoke with {{firstName}} — ",
            }
          : {
              id: generateMessageTemplateId("sms"),
              channel: "sms",
              category,
              label:
                category === "automations"
                  ? "New automated SMS"
                  : category === "ops"
                    ? "New ops SMS"
                    : "New SMS template",
              body: "Hi {{firstName}} — ",
            };
    onChange([...templates, next]);
    setActiveId(next.id);
  }

  function removeTemplate(id: string) {
    const next = templates.filter((t) => t.id !== id);
    onChange(next);
    const remaining = next.filter(
      (t) => t.channel === channel && (t.category ?? "sales") === category,
    );
    setActiveId(remaining[0]?.id ?? "");
  }

  function resetChannel() {
    const next = resetCategoryTemplates(templates, channel, category);
    onChange(next);
    setActiveId(
      next.find((t) => t.channel === channel && (t.category ?? "sales") === category)?.id ?? "",
    );
  }

  const preview =
    active && channel !== "call"
      ? channel === "email"
        ? fillEmailTemplate(active, PREVIEW_CONTEXT)
        : { subject: "", body: fillMessageTemplate(active, PREVIEW_CONTEXT) }
      : active
        ? { subject: "", body: fillMessageTemplate(active, PREVIEW_CONTEXT) }
        : null;

  const isReviewTemplate =
    active?.id === "sms-review-request" || active?.id === "email-review-request";

  const smsLength = active?.channel === "sms" ? active.body.length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,13rem)_1fr]">
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Channel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-2">
          <div className="flex flex-col gap-1 px-1">
            {channels.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannel(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  channel === tab.id
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs font-normal text-slate-500">
                  ({categoryTemplates.filter((t) => t.channel === tab.id).length})
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 px-1 pt-2">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Templates
            </p>
            <ul className="max-h-64 space-y-0.5 overflow-y-auto">
              {channelTemplates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active?.id === t.id
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 w-full gap-1"
              onClick={addTemplate}
            >
              <Plus className="h-3.5 w-3.5" />
              Add template
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        {active ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-base">Edit template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingsField label="Template name" className="w-full">
                  <SettingsInput
                    value={active.label}
                    onChange={(e) => patchTemplate(active.id, { label: e.target.value })}
                  />
                </SettingsField>

                {channel === "email" ? (
                  <SettingsField
                    label="Email subject"
                    hint="Merge fields supported — e.g. {{firstName}}, {{company}}, {{moveDate}}."
                    className="w-full"
                  >
                    <SettingsInput
                      value={active.subject ?? ""}
                      onChange={(e) => patchTemplate(active.id, { subject: e.target.value })}
                    />
                  </SettingsField>
                ) : null}

                <SettingsField
                  label={
                    channel === "email"
                      ? "Email body"
                      : channel === "call"
                        ? "Call note"
                        : "SMS message"
                  }
                  className="w-full"
                >
                  <textarea
                    rows={channel === "email" ? 10 : 5}
                    value={active.body}
                    onChange={(e) => patchTemplate(active.id, { body: e.target.value })}
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  {channel === "sms" ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {smsLength} characters
                      {smsLength > 160 ? " · may split into multiple segments" : ""}
                    </p>
                  ) : null}
                </SettingsField>

                <MergeFieldButtons
                  onInsert={(token) => {
                    patchTemplate(active.id, { body: active.body + token });
                  }}
                  onInsertSubject={
                    channel === "email"
                      ? (token) => {
                          patchTemplate(active.id, {
                            subject: (active.subject ?? "") + token,
                          });
                        }
                      : undefined
                  }
                />

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="secondary" size="sm" onClick={resetChannel}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset {channel} defaults
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-red-700 hover:bg-red-50"
                    onClick={() => removeTemplate(active.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 xl:sticky xl:top-4 xl:self-start">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
                <p className="text-sm text-slate-500">
                  Sample: Jamie Chen · Jun 15, 2026 · Cleveland → Columbus
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {channel === "email" && preview && "subject" in preview ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Subject
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{preview.subject}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {channel === "email" ? "Body" : channel === "call" ? "Note" : "Message"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {preview?.body}
                  </p>
                </div>
                {isReviewTemplate ? (
                  <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <Link
                      href="/portal/move?move=mv-complete"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-600 hover:underline"
                    >
                      Preview customer portal
                    </Link>{" "}
                    — what customers see after a completed move (crew rating + optional Google
                    review).
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Add a template to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function MergeFieldButtons({
  onInsert,
  onInsertSubject,
}: {
  onInsert: (token: string) => void;
  onInsertSubject?: (token: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Insert merge field
      </p>
      <div className="flex flex-wrap gap-2">
        {MESSAGE_TEMPLATE_MERGE_FIELDS.map((field) => (
          <button
            key={field.token}
            type="button"
            onClick={() => onInsert(field.token)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
            title={field.label}
          >
            {field.token}
          </button>
        ))}
      </div>
      {onInsertSubject ? (
        <p className="text-[11px] text-slate-500">
          Click a field to append to the message body — use the subject field for the same tokens.
        </p>
      ) : null}
    </div>
  );
}
