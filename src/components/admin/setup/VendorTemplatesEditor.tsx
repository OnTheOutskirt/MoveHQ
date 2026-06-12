"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  buildClaimVendorTemplateContext,
  defaultVendorMessageTemplates,
  fillVendorEmailTemplate,
  fillVendorSmsTemplate,
  resetVendorTypeTemplates,
  VENDOR_MESSAGE_TEMPLATE_MERGE_FIELDS,
  type VendorMessageTemplatesStore,
} from "@/lib/communications/vendor-message-templates";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

const PREVIEW_CLAIM = {
  id: "clm-preview",
  reference: "CLM-1042",
  moveId: "mv-demo",
  customerName: "Jamie Chen",
  moveReference: "JM-2048",
  status: "in_progress" as const,
  category: "damage" as const,
  title: "Hardwood gouge — bedroom",
  description: "6-inch gouge near closet door.",
  reportedDate: "2026-06-10",
  amountClaimed: 180,
  amountPaid: 0,
  damageDocumentation: "Gouge ~6\" on bedroom hardwood near closet. Photos on move file.",
  checklist: [],
  commsLog: [],
  createdAt: "2026-06-10T12:00:00Z",
  updatedAt: "2026-06-10T12:00:00Z",
};

type VendorTemplatesEditorProps = {
  templates: VendorMessageTemplatesStore;
  onChange: (templates: VendorMessageTemplatesStore) => void;
};

export function VendorTemplatesEditor({ templates, onChange }: VendorTemplatesEditorProps) {
  const { settings } = useSettings();
  const vendorTypes = settings.fieldCatalog.vendorTypes;
  const [activeVendorTypeId, setActiveVendorTypeId] = useState(vendorTypes[0]?.id ?? "claim_repairs");
  const [channel, setChannel] = useState<"sms" | "email">("email");

  const active =
    templates[activeVendorTypeId] ??
    defaultVendorMessageTemplates(vendorTypes)[activeVendorTypeId];

  const previewContext = useMemo(
    () =>
      buildClaimVendorTemplateContext({
        claim: PREVIEW_CLAIM,
        vendorTypeId: activeVendorTypeId,
        vendorDirectoryId: "person:demo-vendor",
      }),
    [activeVendorTypeId],
  );

  const emailPreview = useMemo(
    () => (active ? fillVendorEmailTemplate(active, previewContext) : { subject: "", body: "" }),
    [active, previewContext],
  );

  const smsPreview = useMemo(
    () => (active ? fillVendorSmsTemplate(active, previewContext) : ""),
    [active, previewContext],
  );

  function patchActive(patch: Partial<NonNullable<typeof active>>) {
    if (!active) return;
    onChange({
      ...templates,
      [activeVendorTypeId]: { ...active, ...patch },
    });
  }

  function resetActiveType() {
    onChange(resetVendorTypeTemplates(templates, activeVendorTypeId, vendorTypes));
  }

  if (!active) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        Add vendor types under Setup → Sales → Pipeline &amp; fields to configure templates.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,13rem)_1fr]">
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vendor type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-2">
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {vendorTypes.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setActiveVendorTypeId(entry.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeVendorTypeId === entry.id
                      ? "bg-brand-50 font-medium text-brand-800"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {entry.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-1 pt-2">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Channel
            </p>
            <div className="flex flex-col gap-1">
              {(
                [
                  { id: "email" as const, label: "Email" },
                  { id: "sms" as const, label: "SMS" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChannel(tab.id)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    channel === tab.id
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Vendor templates</h2>
          <p className="text-sm text-slate-500">
            Reusable SMS and email for each vendor type — used when sending claim packages and other
            vendor outreach from Operations → Claims.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base">
                {vendorTypes.find((v) => v.id === activeVendorTypeId)?.label ?? "Vendor"} ·{" "}
                {channel === "email" ? "Email" : "SMS"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channel === "email" ? (
                <SettingsField
                  label="Email subject"
                  hint="Merge fields supported — e.g. {{vendorName}}, {{moveReference}}, {{claimReference}}."
                  className="w-full"
                >
                  <SettingsInput
                    value={active.emailSubject}
                    onChange={(e) => patchActive({ emailSubject: e.target.value })}
                  />
                </SettingsField>
              ) : null}

              <SettingsField
                label={channel === "email" ? "Email body" : "SMS message"}
                className="w-full"
              >
                <textarea
                  rows={channel === "email" ? 12 : 5}
                  value={channel === "email" ? active.emailBody : active.smsBody}
                  onChange={(e) =>
                    patchActive(
                      channel === "email"
                        ? { emailBody: e.target.value }
                        : { smsBody: e.target.value },
                    )
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                {channel === "sms" ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {active.smsBody.length} characters
                    {active.smsBody.length > 160 ? " · may split into multiple segments" : ""}
                  </p>
                ) : null}
              </SettingsField>

              <MergeFieldButtons
                onInsert={(token) => {
                  if (channel === "email") {
                    patchActive({ emailBody: active.emailBody + token });
                  } else {
                    patchActive({ smsBody: active.smsBody + token });
                  }
                }}
                onInsertSubject={
                  channel === "email"
                    ? (token) => patchActive({ emailSubject: active.emailSubject + token })
                    : undefined
                }
              />

              <div className="border-t border-slate-100 pt-4">
                <Button type="button" variant="secondary" size="sm" onClick={resetActiveType}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset this vendor type
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 xl:sticky xl:top-4 xl:self-start">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <p className="text-sm text-slate-500">
                Sample claim CLM-1042 · MoveBees · Jamie Chen
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {channel === "email" ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Subject
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{emailPreview.subject}</p>
                </div>
              ) : null}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {channel === "email" ? "Body" : "Message"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {channel === "email" ? emailPreview.body : smsPreview}
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
        {VENDOR_MESSAGE_TEMPLATE_MERGE_FIELDS.map((field) => (
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
          Fields append to the message body — type directly in the subject field for subject tokens.
        </p>
      ) : null}
    </div>
  );
}
