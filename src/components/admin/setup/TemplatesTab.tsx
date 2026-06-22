"use client";

import { DocumentEmailPreview } from "@/components/admin/setup/document-templates/DocumentEmailPreview";
import { DocumentPortalPreviewPanel } from "@/components/admin/setup/document-templates/DocumentPortalPreviewPanel";
import { MergeFieldPicker } from "@/components/admin/setup/document-templates/MergeFieldPicker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/admin/setup/document-templates/RichTextEditor";
import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { defaultDocumentTemplate } from "@/lib/settings/document-template-normalize";
import { resolveDocumentAccentColor } from "@/lib/settings/document-accent";
import { buildDocumentPreviewVars } from "@/lib/settings/document-preview";
import type { DocumentPortalView, DocumentPreviewPricing } from "@/lib/settings/document-preview";
import { DEFAULT_PORTAL_ACCENT } from "@/lib/settings/document-template-defaults";
import type {
  DocumentPortalSettings,
  DocumentTemplate,
  DocumentTemplateType,
} from "@/lib/settings/document-template-types";
import { useMemo, useRef, useState, type RefObject } from "react";

type TemplatesTabProps = {
  templates: DocumentTemplate[];
  onChange: (templates: DocumentTemplate[]) => void;
};

type EditorPane = "email" | "portal";

export function TemplatesTab({ templates, onChange }: TemplatesTabProps) {
  const { settings } = useSettings();
  const [activeId, setActiveId] = useState<DocumentTemplateType>("quote");
  const [editorPane, setEditorPane] = useState<EditorPane>("email");
  const [previewPricing, setPreviewPricing] = useState<DocumentPreviewPricing>("flat");
  const [previewUnregulated, setPreviewUnregulated] = useState(false);
  const [previewBallpark, setPreviewBallpark] = useState(true);
  const [previewPortalView, setPreviewPortalView] = useState<DocumentPortalView>("document");

  const active = useMemo(
    () => templates.find((t) => t.id === activeId) ?? templates[0]!,
    [templates, activeId],
  );

  const previewVars = useMemo(
    () =>
      buildDocumentPreviewVars(settings, {
        pricing: previewPricing,
        forceUnregulated: previewUnregulated,
        showBallpark: previewPricing === "hourly" ? previewBallpark : false,
      }),
    [settings, previewPricing, previewUnregulated, previewBallpark],
  );

  const previewAccent = resolveDocumentAccentColor(active, settings.branding.accentColor);

  function patchTemplate(patch: Partial<DocumentTemplate>) {
    onChange(
      templates.map((t) =>
        t.id === activeId ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
      ),
    );
  }

  function patchEmail(patch: Partial<DocumentTemplate["email"]>) {
    patchTemplate({ email: { ...active.email, ...patch } });
  }

  function patchPortal(patch: Partial<DocumentPortalSettings>) {
    patchTemplate({ portal: { ...active.portal, ...patch } });
  }

  function resetActive() {
    onChange(templates.map((t) => (t.id === activeId ? defaultDocumentTemplate(activeId) : t)));
  }

  return (
    <div className="space-y-4">
      <TabBar
        tabs={templates.map((t) => ({ id: t.id, label: t.name }))}
        activeTab={activeId}
        onChange={setActiveId}
      />

      <div className="min-w-0 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{active.name}</h2>
          <p className="text-sm text-slate-500">{active.description}</p>
        </div>

        <TabBar
          tabs={[
            { id: "email", label: "Email" },
            { id: "portal", label: "Customer portal" },
          ]}
          activeTab={editorPane}
          onChange={setEditorPane}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base">
                {editorPane === "email" ? "Email copy" : "Portal page"}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {editorPane === "email"
                  ? "Subject and body sent with the portal link."
                  : "Branded web page — logo from Company settings; accent defaults to Jonah's blue."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {editorPane === "email" ? (
                <EmailEditor email={active.email} onChange={patchEmail} />
              ) : (
                <PortalEditor
                  portal={active.portal}
                  kind={activeId}
                  accentColor={active.accentColor}
                  globalAccentColor={settings.branding.accentColor}
                  onChange={patchPortal}
                  onAccentChange={(accentColor) => patchTemplate({ accentColor })}
                />
              )}
              <Button type="button" variant="secondary" size="sm" onClick={resetActive}>
                Reset {active.name.toLowerCase()} template
              </Button>
            </CardContent>
          </Card>

          <div className="min-w-0 xl:sticky xl:top-4 xl:self-start">
            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </p>
              {editorPane === "portal" ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  Mobile view here — use Open preview window for desktop.
                </p>
              ) : null}
            </div>
            {editorPane === "email" ? (
              <DocumentEmailPreview
                subject={active.email.subject}
                body={active.email.body}
                vars={previewVars}
              />
            ) : (
              <DocumentPortalPreviewPanel
                kind={activeId}
                portal={active.portal}
                vars={previewVars}
                logoDataUrl={settings.branding.logoDataUrl}
                accentColor={previewAccent}
                companyName={settings.branding.companyName}
                pricing={previewPricing}
                onPricingChange={setPreviewPricing}
                unregulated={previewUnregulated}
                onUnregulatedChange={setPreviewUnregulated}
                showBallpark={previewBallpark}
                onShowBallparkChange={setPreviewBallpark}
                portalView={previewPortalView}
                onPortalViewChange={setPreviewPortalView}
                viewport="mobile"
                previewForceUnregulated={previewUnregulated}
                showViewToggle={activeId === "contract"}
                showViewportToggle={false}
                embedded
                interactive
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailEditor({
  email,
  onChange,
}: {
  email: DocumentTemplate["email"];
  onChange: (patch: Partial<DocumentTemplate["email"]>) => void;
}) {
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyEditorRef = useRef<RichTextEditorHandle>(null);
  const [focusTarget, setFocusTarget] = useState<"subject" | "body">("body");

  function insertToken(token: string) {
    if (focusTarget === "subject") {
      const el = subjectRef.current;
      const start = el?.selectionStart ?? email.subject.length;
      const end = el?.selectionEnd ?? start;
      const next = email.subject.slice(0, start) + token + email.subject.slice(end);
      onChange({ subject: next });
      requestAnimationFrame(() => {
        el?.focus();
        const cursor = start + token.length;
        el?.setSelectionRange(cursor, cursor);
      });
      return;
    }
    bodyEditorRef.current?.insertText(token);
  }

  return (
    <>
      <SettingsField label="Subject line" className="w-full">
        <SettingsInput
          ref={subjectRef}
          value={email.subject}
          onFocus={() => setFocusTarget("subject")}
          onChange={(e) => onChange({ subject: e.target.value })}
        />
      </SettingsField>
      <SettingsField
        label="Email body"
        hint="Use the toolbar for bold, lists, and more. Include {{portal_link}} so customers can open the page."
        className="w-full"
      >
        <RichTextEditor
          ref={bodyEditorRef}
          value={email.body}
          onFocus={() => setFocusTarget("body")}
          onChange={(body) => onChange({ body })}
          minHeight={220}
          placeholder="Write your email…"
        />
      </SettingsField>
      <MergeFieldPicker onInsert={insertToken} />
    </>
  );
}

function PortalEditor({
  portal,
  kind,
  accentColor,
  globalAccentColor,
  onChange,
  onAccentChange,
}: {
  portal: DocumentPortalSettings;
  kind: DocumentTemplateType;
  accentColor: string | null;
  globalAccentColor: string;
  onChange: (patch: Partial<DocumentPortalSettings>) => void;
  onAccentChange: (accentColor: string | null) => void;
}) {
  type PortalField = "headline" | "intro" | "mainContent" | "footerNote";
  const [focusField, setFocusField] = useState<PortalField>("mainContent");
  const headlineRef = useRef<HTMLInputElement>(null);
  const introEditorRef = useRef<RichTextEditorHandle>(null);
  const mainEditorRef = useRef<RichTextEditorHandle>(null);
  const footerEditorRef = useRef<RichTextEditorHandle>(null);

  const editorRefs: Record<Exclude<PortalField, "headline">, RefObject<RichTextEditorHandle | null>> = {
    intro: introEditorRef,
    mainContent: mainEditorRef,
    footerNote: footerEditorRef,
  };

  function insertToken(token: string) {
    if (focusField === "headline") {
      const el = headlineRef.current;
      const start = el?.selectionStart ?? portal.headline.length;
      const end = el?.selectionEnd ?? start;
      const next = portal.headline.slice(0, start) + token + portal.headline.slice(end);
      onChange({ headline: next });
      requestAnimationFrame(() => {
        el?.focus();
        const cursor = start + token.length;
        el?.setSelectionRange(cursor, cursor);
      });
      return;
    }
    editorRefs[focusField].current?.insertText(token);
  }

  return (
    <>
      <SettingsField
        label="Portal accent color"
        hint={`Default ${DEFAULT_PORTAL_ACCENT}. Overrides global branding (${globalAccentColor}) when set.`}
        className="w-full"
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={accentColor ?? globalAccentColor}
            onChange={(e) => onAccentChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-slate-200"
          />
          <SettingsInput
            value={accentColor ?? ""}
            onChange={(e) => onAccentChange(e.target.value.trim() || null)}
            placeholder={`Use global (${globalAccentColor})`}
            className="max-w-[10rem] font-mono"
          />
          {accentColor ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onAccentChange(null)}>
              Use global
            </Button>
          ) : null}
        </div>
      </SettingsField>

      <SettingsField label="Page headline" className="w-full">
        <SettingsInput
          ref={headlineRef}
          value={portal.headline}
          onFocus={() => setFocusField("headline")}
          onChange={(e) => onChange({ headline: e.target.value })}
        />
      </SettingsField>

      <SettingsField label="Intro paragraph" className="w-full">
        <RichTextEditor
          ref={introEditorRef}
          value={portal.intro}
          onFocus={() => setFocusField("intro")}
          onChange={(intro) => onChange({ intro })}
          minHeight={100}
          placeholder="Intro text shown under the headline…"
        />
      </SettingsField>

      {kind === "quote" ? (
        <SettingsField
          label="Welcome video URL"
          hint="YouTube, Vimeo, or direct MP4 — Jonah's welcome video slot on quotes."
          className="w-full"
        >
          <SettingsInput
            value={portal.videoUrl}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </SettingsField>
      ) : null}

      <SettingsField
        label="Main content"
        hint="Bold, bullet lists, and merge fields. Switch to HTML source to edit markup directly."
        className="w-full"
      >
        <RichTextEditor
          ref={mainEditorRef}
          value={portal.mainContent}
          onFocus={() => setFocusField("mainContent")}
          onChange={(mainContent) => onChange({ mainContent })}
          minHeight={200}
          placeholder="Scope, pricing notes, next steps…"
        />
      </SettingsField>

      <SettingsField label="Footer note" className="w-full">
        <RichTextEditor
          ref={footerEditorRef}
          value={portal.footerNote}
          onFocus={() => setFocusField("footerNote")}
          onChange={(footerNote) => onChange({ footerNote })}
          minHeight={80}
          placeholder="Contact info or closing note…"
        />
      </SettingsField>

      <SettingsField
        label="Hourly terms & conditions"
        hint="Shown in a modal when the move is priced hourly. One section per paragraph starting with “Section N”."
        className="w-full"
      >
        <textarea
          value={portal.termsHourly}
          onChange={(e) => onChange({ termsHourly: e.target.value })}
          rows={8}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed text-slate-800"
        />
      </SettingsField>

      <SettingsField
        label="Flat rate terms & conditions"
        hint="Shown in a modal when the move is flat rate. Customers on quotes can read; contracts require acceptance."
        className="w-full"
      >
        <textarea
          value={portal.termsFlat}
          onChange={(e) => onChange({ termsFlat: e.target.value })}
          rows={8}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed text-slate-800"
        />
      </SettingsField>

      {kind === "quote" ? (
        <SettingsField
          label="Booking — card charge acknowledgment"
          hint="Required checkbox before “I'd like to book this move.” Distinct from general terms. Supports merge fields like {{company_name}}."
          className="w-full"
        >
          <textarea
            value={portal.bookingCardChargeAcknowledgment}
            onChange={(e) => onChange({ bookingCardChargeAcknowledgment: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800"
          />
        </SettingsField>
      ) : null}

      <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Portal sections
        </p>
        <ToggleRow
          label="Pricing summary card"
          checked={portal.showPricingSummary}
          onChange={(v) => onChange({ showPricingSummary: v })}
        />
        <ToggleRow
          label="Flat-rate all-in breakdown"
          checked={portal.showFlatBreakdown}
          onChange={(v) => onChange({ showFlatBreakdown: v })}
        />
        <ToggleRow
          label="Move contents review & confirm"
          checked={portal.showContents}
          onChange={(v) => onChange({ showContents: v })}
        />
        <ToggleRow
          label="Deposit / validity callout"
          checked={portal.showDepositLine}
          onChange={(v) => onChange({ showDepositLine: v })}
        />
        <ToggleRow
          label="Valuation & liability coverage"
          checked={portal.showValuation}
          onChange={(v) => onChange({ showValuation: v })}
        />
        {portal.showValuation ? (
          <label className="flex cursor-pointer items-center gap-2 pl-1 text-xs text-slate-600">
            <span className="text-slate-500">Unregulated moves:</span>
            <select
              value={portal.unregulatedValuationDisplay}
              onChange={(e) =>
                onChange({
                  unregulatedValuationDisplay: e.target.value as "hidden" | "notice",
                })
              }
              className="rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="notice">Show notice (no coverage)</option>
              <option value="hidden">Hide section</option>
            </select>
          </label>
        ) : null}
        <ToggleRow
          label="Terms & conditions"
          checked={portal.showTerms}
          onChange={(v) => onChange({ showTerms: v })}
        />
        {kind === "contract" ? (
          <ToggleRow
            label="Signature block"
            checked={portal.showSignatureBlock}
            onChange={(v) => onChange({ showSignatureBlock: v })}
          />
        ) : null}
      </div>

      <MergeFieldPicker onInsert={insertToken} />
    </>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className="rounded border-slate-300 text-brand-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
