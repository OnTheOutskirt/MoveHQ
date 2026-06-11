import { buildDocumentTemplateVars } from "@/lib/moves/document-template-render";
import type { MoveDepositSummary } from "@/lib/moves/move-deposit";
import type { MoveRecord } from "@/lib/moves/types";
import { sampleDocumentVars } from "@/lib/settings/document-template-defaults";
import {
  sampleDocumentMoveContents,
  serializeMoveContents,
} from "@/lib/settings/document-move-contents";
import { sampleValuationVars } from "@/lib/settings/document-valuation";
import type { AppSettings } from "@/lib/settings/types";

export type DocumentPreviewPricing = "flat" | "hourly";
export type DocumentPortalView = "document" | "checkout" | "confirmed";

export type DocumentPreviewOptions = {
  pricing?: DocumentPreviewPricing;
  forceUnregulated?: boolean;
  showBallpark?: boolean;
  view?: DocumentPortalView;
  viewport?: "mobile" | "desktop";
};

export const DEFAULT_DOCUMENT_CONTACT = {
  phone: "(832) 728-6675",
  email: "info@jonahsmovers.com",
} as const;

export function buildDocumentPreviewVars(
  settings: AppSettings,
  options: DocumentPreviewOptions = {},
  move?: MoveRecord,
  deposit?: MoveDepositSummary,
): Record<string, string> {
  const base = move && deposit
    ? buildDocumentTemplateVars(move, settings, deposit)
    : {
        ...sampleDocumentVars(settings.branding.companyName),
        company_phone: settings.company.phone || DEFAULT_DOCUMENT_CONTACT.phone,
        company_email: settings.company.email || DEFAULT_DOCUMENT_CONTACT.email,
      };

  const withValuation = sampleValuationVars(base, {
    pricing: options.pricing ?? (base.pricing_type_key === "hourly" ? "hourly" : "flat"),
    forceUnregulated: options.forceUnregulated,
    showBallpark: options.showBallpark,
  });

  return {
    ...withValuation,
    shipper_name: withValuation.shipper_name || withValuation.customer_name,
    move_contents_json:
      withValuation.move_contents_json || serializeMoveContents(sampleDocumentMoveContents()),
  };
}

export function documentPreviewSearchParams(options: DocumentPreviewOptions & { kind?: string }): string {
  const params = new URLSearchParams();
  if (options.kind) params.set("kind", options.kind);
  if (options.pricing) params.set("pricing", options.pricing);
  if (options.forceUnregulated) params.set("unregulated", "1");
  if (options.showBallpark) params.set("ballpark", "1");
  if (options.view === "confirmed") params.set("view", "confirmed");
  if (options.view === "checkout") params.set("view", "checkout");
  if (options.viewport === "desktop") params.set("viewport", "desktop");
  return params.toString();
}

export function parseDocumentPreviewSearchParams(searchParams: URLSearchParams): DocumentPreviewOptions & { kind: "quote" | "contract" } {
  return {
    kind: searchParams.get("kind") === "contract" ? "contract" : "quote",
    pricing: searchParams.get("pricing") === "hourly" ? "hourly" : "flat",
    forceUnregulated: searchParams.get("unregulated") === "1",
    showBallpark: searchParams.get("ballpark") === "1",
    view:
      searchParams.get("view") === "confirmed"
        ? "confirmed"
        : searchParams.get("view") === "checkout"
          ? "checkout"
          : "document",
    viewport: searchParams.get("viewport") === "desktop" ? "desktop" : "mobile",
  };
}

export function documentPreviewWindowUrl(
  kind: "quote" | "contract",
  options: DocumentPreviewOptions = {},
): string {
  const qs = documentPreviewSearchParams({ ...options, kind });
  return `/portal/preview${qs ? `?${qs}` : ""}`;
}
