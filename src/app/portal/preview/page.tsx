"use client";

import { DocumentPortalPreviewPanel } from "@/components/admin/setup/document-templates/DocumentPortalPreviewPanel";
import type { PortalPreviewViewport } from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import { useSettings } from "@/components/providers/SettingsProvider";
import { resolveDocumentAccentColor } from "@/lib/settings/document-accent";
import {
  buildDocumentPreviewVars,
  parseDocumentPreviewSearchParams,
  type DocumentPortalView,
  type DocumentPreviewPricing,
} from "@/lib/settings/document-preview";
import { defaultDocumentTemplate } from "@/lib/settings/document-template-normalize";
import { loadDocumentTemplates } from "@/lib/settings/storage";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

export default function PortalPreviewPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const parsed = useMemo(
    () => parseDocumentPreviewSearchParams(searchParams),
    [searchParams],
  );

  const [pricing, setPricing] = useState<DocumentPreviewPricing>(parsed.pricing ?? "flat");
  const [unregulated, setUnregulated] = useState(parsed.forceUnregulated ?? false);
  const [showBallpark, setShowBallpark] = useState(parsed.showBallpark ?? true);
  const [portalView, setPortalView] = useState<DocumentPortalView>(parsed.view ?? "document");
  const [viewport, setViewport] = useState<PortalPreviewViewport>(parsed.viewport ?? "mobile");

  useEffect(() => {
    setPricing(parsed.pricing ?? "flat");
    setUnregulated(parsed.forceUnregulated ?? false);
    setShowBallpark(parsed.showBallpark ?? true);
    setPortalView(parsed.view ?? "document");
    setViewport(parsed.viewport ?? "mobile");
  }, [
    parsed.pricing,
    parsed.forceUnregulated,
    parsed.showBallpark,
    parsed.view,
    parsed.viewport,
  ]);

  const template = useMemo(() => {
    const templates = loadDocumentTemplates();
    return templates.find((t) => t.id === parsed.kind) ?? defaultDocumentTemplate(parsed.kind);
  }, [parsed.kind]);

  const previewVars = useMemo(
    () =>
      buildDocumentPreviewVars(settings, {
        pricing,
        forceUnregulated: unregulated,
        showBallpark: pricing === "hourly" ? showBallpark : false,
      }),
    [settings, pricing, unregulated, showBallpark],
  );

  const accent = resolveDocumentAccentColor(template, settings.branding.accentColor);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Customer portal preview
        </p>
        <h1 className="text-lg font-semibold text-slate-900">
          {template.name} · {settings.branding.companyName}
        </h1>
      </header>

      <DocumentPortalPreviewPanel
        kind={parsed.kind}
        portal={template.portal}
        vars={previewVars}
        logoDataUrl={settings.branding.logoDataUrl}
        accentColor={accent}
        companyName={settings.branding.companyName}
        pricing={pricing}
        onPricingChange={setPricing}
        unregulated={unregulated}
        onUnregulatedChange={setUnregulated}
        showBallpark={showBallpark}
        onShowBallparkChange={setShowBallpark}
        portalView={portalView}
        onPortalViewChange={setPortalView}
        viewport={viewport}
        onViewportChange={setViewport}
        previewForceUnregulated={unregulated}
        showViewToggle={parsed.kind === "contract"}
        showOpenWindow={false}
        interactive
      />
    </div>
  );
}
