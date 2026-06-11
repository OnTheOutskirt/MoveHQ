"use client";

import type {
  DocumentPortalView,
  DocumentPreviewOptions,
  DocumentPreviewPricing,
} from "@/lib/settings/document-preview";
import { documentPreviewWindowUrl } from "@/lib/settings/document-preview";
import type { PortalPreviewViewport } from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

type DocumentPortalPreviewControlsProps = {
  kind: "quote" | "contract";
  pricing: DocumentPreviewPricing;
  onPricingChange: (v: DocumentPreviewPricing) => void;
  unregulated: boolean;
  onUnregulatedChange: (v: boolean) => void;
  showBallpark: boolean;
  onShowBallparkChange: (v: boolean) => void;
  portalView: DocumentPortalView;
  onPortalViewChange: (v: DocumentPortalView) => void;
  viewport?: PortalPreviewViewport;
  showViewToggle?: boolean;
  showOpenWindow?: boolean;
  className?: string;
};

export function DocumentPortalPreviewControls({
  kind,
  pricing,
  onPricingChange,
  unregulated,
  onUnregulatedChange,
  showBallpark,
  onShowBallparkChange,
  portalView,
  onPortalViewChange,
  viewport = "mobile",
  showViewToggle = true,
  showOpenWindow = true,
  className,
}: DocumentPortalPreviewControlsProps) {
  function openWindow() {
    const options: DocumentPreviewOptions = {
      pricing,
      forceUnregulated: unregulated,
      showBallpark: pricing === "hourly" ? showBallpark : false,
      view: portalView,
      viewport,
    };
    window.open(documentPreviewWindowUrl(kind, options), "_blank", "noopener,noreferrer");
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
        <button
          type="button"
          onClick={() => onPricingChange("flat")}
          className={cn(
            "rounded-md px-2.5 py-1 font-medium transition",
            pricing === "flat" ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:text-slate-900",
          )}
        >
          Flat rate
        </button>
        <button
          type="button"
          onClick={() => onPricingChange("hourly")}
          className={cn(
            "rounded-md px-2.5 py-1 font-medium transition",
            pricing === "hourly" ? "bg-amber-50 text-amber-900" : "text-slate-600 hover:text-slate-900",
          )}
        >
          Hourly
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-600">
        <input
          type="checkbox"
          checked={unregulated}
          onChange={(e) => onUnregulatedChange(e.target.checked)}
          className="rounded border-slate-300"
        />
        Unregulated move
      </label>

      {pricing === "hourly" ? (
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-600">
          <input
            type="checkbox"
            checked={showBallpark}
            onChange={(e) => onShowBallparkChange(e.target.checked)}
            className="rounded border-slate-300"
          />
          Ballpark total
        </label>
      ) : null}

      {showViewToggle && kind === "contract" ? (
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => onPortalViewChange("document")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition",
              portalView === "document"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            Agreement
          </button>
          <button
            type="button"
            onClick={() => onPortalViewChange("checkout")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition",
              portalView === "checkout"
                ? "bg-brand-50 text-brand-900"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            Sign &amp; pay
          </button>
          <button
            type="button"
            onClick={() => onPortalViewChange("confirmed")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition",
              portalView === "confirmed"
                ? "bg-emerald-50 text-emerald-900"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            After deposit
          </button>
        </div>
      ) : null}

      {showOpenWindow ? (
        <button
          type="button"
          onClick={openWindow}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          <ExternalLink className="h-3 w-3" />
          Open preview window
          <span className="hidden sm:inline"> (desktop there)</span>
        </button>
      ) : null}
    </div>
  );
}
