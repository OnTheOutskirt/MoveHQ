"use client";

import { DocumentPortalPreview } from "@/components/admin/setup/document-templates/DocumentPortalPreview";
import { DocumentPortalPreviewControls } from "@/components/admin/setup/document-templates/DocumentPortalPreviewControls";
import {
  DocumentPortalPreviewFrame,
  type PortalPreviewViewport,
} from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import type { DocumentPortalView, DocumentPreviewPricing } from "@/lib/settings/document-preview";
import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import type { DocumentPortalSettings } from "@/lib/settings/document-template-types";

type DocumentPortalPreviewPanelProps = {
  kind: DocumentSendKind;
  portal: DocumentPortalSettings;
  vars: Record<string, string>;
  logoDataUrl: string | null;
  accentColor: string;
  companyName: string;
  pricing: DocumentPreviewPricing;
  onPricingChange: (v: DocumentPreviewPricing) => void;
  unregulated: boolean;
  onUnregulatedChange: (v: boolean) => void;
  showBallpark: boolean;
  onShowBallparkChange: (v: boolean) => void;
  portalView: DocumentPortalView;
  onPortalViewChange: (v: DocumentPortalView) => void;
  viewport: PortalPreviewViewport;
  onViewportChange?: (v: PortalPreviewViewport) => void;
  previewForceUnregulated?: boolean;
  interactive?: boolean;
  showViewToggle?: boolean;
  showOpenWindow?: boolean;
  showViewportToggle?: boolean;
  /** Side-by-side setup editor — mobile preview only. */
  embedded?: boolean;
  controlsClassName?: string;
};

export function DocumentPortalPreviewPanel({
  kind,
  portal,
  vars,
  logoDataUrl,
  accentColor,
  companyName,
  pricing,
  onPricingChange,
  unregulated,
  onUnregulatedChange,
  showBallpark,
  onShowBallparkChange,
  portalView,
  onPortalViewChange,
  viewport,
  onViewportChange,
  previewForceUnregulated,
  interactive = true,
  showViewToggle = true,
  showOpenWindow = true,
  showViewportToggle = true,
  embedded = false,
  controlsClassName,
}: DocumentPortalPreviewPanelProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DocumentPortalPreviewControls
        kind={kind}
        pricing={pricing}
        onPricingChange={onPricingChange}
        unregulated={unregulated}
        onUnregulatedChange={onUnregulatedChange}
        showBallpark={showBallpark}
        onShowBallparkChange={onShowBallparkChange}
        portalView={portalView}
        onPortalViewChange={onPortalViewChange}
        viewport={viewport}
        showViewToggle={showViewToggle}
        showOpenWindow={showOpenWindow}
        className={controlsClassName}
      />
      <DocumentPortalPreviewFrame
        viewport={viewport}
        onViewportChange={onViewportChange}
        showViewportToggle={showViewportToggle}
        embedded={embedded}
      >
        <DocumentPortalPreview
          portal={portal}
          vars={vars}
          kind={kind}
          logoDataUrl={logoDataUrl}
          accentColor={accentColor}
          companyName={companyName}
          previewForceUnregulated={previewForceUnregulated}
          portalView={portalView}
          onPortalViewChange={onPortalViewChange}
          interactive={interactive}
          framed
          viewport={viewport}
        />
      </DocumentPortalPreviewFrame>
    </div>
  );
}
