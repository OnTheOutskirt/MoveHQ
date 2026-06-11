"use client";

import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  buildWalkthroughShareFillContext,
  defaultWalkthroughShareTemplates,
  fillWalkthroughShareEmail,
  fillWalkthroughShareSms,
  WALKTHROUGH_SHARE_KIND_OPTIONS,
  WALKTHROUGH_SHARE_MERGE_FIELDS,
  type WalkthroughShareKind,
  type WalkthroughShareTemplates,
} from "@/lib/communications/walkthrough-share-templates";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

const PREVIEW_CONTEXT = buildWalkthroughShareFillContext({
  customerName: "Jamie Chen",
  moveReference: "JM-2048",
  linkUrl: "https://moves.jonahsmovers.com/portal/walkthrough?move=demo",
  assignee: "Pat Kim",
  slotLabel: "Mon, Jun 9 at 10:00 AM",
});

type WalkthroughShareTemplatesEditorProps = {
  templates: WalkthroughShareTemplates;
  onChange: (templates: WalkthroughShareTemplates) => void;
};

export function WalkthroughShareTemplatesEditor({
  templates,
  onChange,
}: WalkthroughShareTemplatesEditorProps) {
  const [activeKind, setActiveKind] = useState<WalkthroughShareKind>("scheduling");
  const active = templates[activeKind];
  const activeMeta = WALKTHROUGH_SHARE_KIND_OPTIONS.find((k) => k.id === activeKind)!;

  const emailPreview = useMemo(
    () => fillWalkthroughShareEmail(activeKind, PREVIEW_CONTEXT, templates),
    [activeKind, templates],
  );
  const smsPreview = useMemo(
    () => fillWalkthroughShareSms(activeKind, PREVIEW_CONTEXT, templates),
    [activeKind, templates],
  );

  function patchSet(patch: Partial<typeof active>) {
    onChange({
      ...templates,
      [activeKind]: { ...active, ...patch },
    });
  }

  function resetKind() {
    const defaults = defaultWalkthroughShareTemplates();
    onChange({
      ...templates,
      [activeKind]: defaults[activeKind],
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,13rem)_1fr]">
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Walkthrough type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          <ul>
            {WALKTHROUGH_SHARE_KIND_OPTIONS.map((kind) => (
              <li key={kind.id}>
                <button
                  type="button"
                  onClick={() => setActiveKind(kind.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeKind === kind.id
                      ? "bg-brand-50 font-medium text-brand-800"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {kind.label}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{activeMeta.label}</h2>
          <p className="text-sm text-slate-500">{activeMeta.description}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base">Default message</CardTitle>
              <p className="text-sm text-slate-500">
                Pre-fills the email or SMS composer when sharing this link from Book walkthrough.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingsField
                label="Email subject"
                hint="Used when staff click Email on this link type."
                className="w-full"
              >
                <SettingsInput
                  value={active.emailSubject}
                  onChange={(e) => patchSet({ emailSubject: e.target.value })}
                />
              </SettingsField>

              <SettingsField label="Email body" className="w-full">
                <textarea
                  rows={10}
                  value={active.emailBody}
                  onChange={(e) => patchSet({ emailBody: e.target.value })}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </SettingsField>

              <SettingsField
                label="SMS message"
                hint={`${active.smsBody.length} characters`}
                className="w-full"
              >
                <textarea
                  rows={4}
                  value={active.smsBody}
                  onChange={(e) => patchSet({ smsBody: e.target.value })}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </SettingsField>

              <MergeFieldButtons
                onInsertBody={(token) => patchSet({ emailBody: active.emailBody + token })}
                onInsertSms={(token) => patchSet({ smsBody: active.smsBody + token })}
                onInsertSubject={(token) =>
                  patchSet({ emailSubject: active.emailSubject + token })
                }
              />

              <div className="border-t border-slate-100 pt-4">
                <Button type="button" variant="secondary" size="sm" onClick={resetKind}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset {activeMeta.label.toLowerCase()} defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 xl:sticky xl:top-4 xl:self-start">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <p className="text-sm text-slate-500">
                Sample: {PREVIEW_CONTEXT.firstName}, Pat Kim, booked slot
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Email subject
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{emailPreview.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Email body
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {emailPreview.body}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  SMS
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {smsPreview}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {smsPreview.length} characters
                  {smsPreview.length > 160 ? " · may split into multiple segments" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MergeFieldButtons({
  onInsertBody,
  onInsertSms,
  onInsertSubject,
}: {
  onInsertBody: (token: string) => void;
  onInsertSms: (token: string) => void;
  onInsertSubject: (token: string) => void;
}) {
  return (
    <div className="space-y-3">
      <MergeFieldRow label="Email subject" onInsert={onInsertSubject} />
      <MergeFieldRow label="Email body" onInsert={onInsertBody} />
      <MergeFieldRow label="SMS" onInsert={onInsertSms} />
    </div>
  );
}

function MergeFieldRow({
  label,
  onInsert,
}: {
  label: string;
  onInsert: (token: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {WALKTHROUGH_SHARE_MERGE_FIELDS.map((field) => (
          <button
            key={`${label}-${field.token}`}
            type="button"
            onClick={() => onInsert(field.token)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
            title={field.label}
          >
            {field.token}
          </button>
        ))}
      </div>
    </div>
  );
}
