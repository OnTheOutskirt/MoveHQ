import { formatMoveDatesDisplay } from "@/lib/moves/move-dates";

import { formatQuote } from "@/lib/moves/format";

import type { MoveDepositSummary } from "@/lib/moves/move-deposit";

import type { AppSettings, DocumentTemplate } from "@/lib/settings/types";

import type { DocumentPortalSettings } from "@/lib/settings/document-template-types";

import { moveShipperName } from "./get-move-contact";
import type { MoveRecord } from "./types";
import { DEFAULT_DOCUMENT_CONTACT } from "@/lib/settings/document-preview";
import {
  buildDocumentMoveContents,
  serializeMoveContents,
} from "@/lib/settings/document-move-contents";
import { renderDocumentRichHtml } from "@/lib/settings/document-rich-text";
import {
  formatInventoryBasisLabel,
  formatInventoryVolumeDisplay,
  inventoryVolumeForMove,
} from "@/lib/moves/inventory-basis";
import {
  computeQuoteDiscount,
  effectiveFlatQuoteTotal,
  effectiveHourlyLaborRate,
  estimateHourlyMoveTotal,
  formatHourlyRate,
  resolveBallparkHours,
} from "@/lib/moves/quote-discount";
import {
  buildDocumentValuationContext,
  buildFlatPricingLines,
  buildHourlyPricingLines,
  flatQuoteCoreAmount,
  formatMoney as formatValuationMoney,
} from "@/lib/settings/document-valuation";



export type DocumentSendKind = "quote" | "contract";



export { DOCUMENT_MERGE_FIELDS, mergeFieldToken } from "@/lib/settings/document-template-defaults";



function formatMoney(amount: number): string {

  return new Intl.NumberFormat("en-US", {

    style: "currency",

    currency: "USD",

    maximumFractionDigits: 0,

  }).format(amount);

}



function quoteExpiryDate(move: MoveRecord, validityDays: number): string {

  const base = move.updatedAt ? new Date(move.updatedAt) : new Date();

  base.setDate(base.getDate() + validityDays);

  return base.toLocaleDateString("en-US", {

    month: "long",

    day: "numeric",

    year: "numeric",

  });

}



function firstArrivalWindow(move: MoveRecord): string {

  const day = move.jobDays.find((d) => d.arrivalWindow);

  return day?.arrivalWindow ?? "TBD";

}



function customerFirstName(name: string): string {

  return name.trim().split(/\s+/)[0] ?? name;

}



export function buildDocumentTemplateVars(

  move: MoveRecord,

  settings: AppSettings,

  deposit: MoveDepositSummary,

): Record<string, string> {

  const { branding, company, defaults, fieldCatalog } = settings;

  const discount = computeQuoteDiscount(move, fieldCatalog.discountReasons);
  const valuation = buildDocumentValuationContext(move);
  const displayAmount =
    move.quoteType === "flat" && move.quoteAmount != null
      ? effectiveFlatQuoteTotal(move, fieldCatalog.discountReasons)
      : move.quoteType === "hourly" && move.quoteAmount != null
        ? effectiveHourlyLaborRate(move, fieldCatalog.discountReasons)
        : move.quoteAmount;

  const flatCore =
    move.quoteType === "flat" && displayAmount != null
      ? flatQuoteCoreAmount(displayAmount, move.intake.liabilityPremium ?? 0)
      : null;
  const flatAllIn =
    flatCore != null ? flatCore + valuation.premium : null;

  const ballparkHours = resolveBallparkHours(move);
  const hourlyBallparkCore =
    move.quoteType === "hourly" &&
    move.quoteAmount != null &&
    ballparkHours
      ? discount?.discountedBallparkTotal ??
        estimateHourlyMoveTotal(
          move,
          ballparkHours,
          discount?.discountedLaborRate ?? move.quoteAmount,
        )
      : null;
  const hourlyBallparkTotal =
    hourlyBallparkCore != null ? hourlyBallparkCore + valuation.premium : null;
  const hourlyBallparkOriginalCore =
    move.quoteType === "hourly" &&
    ballparkHours &&
    discount?.hasDiscount &&
    discount.originalBallparkTotal != null
      ? discount.originalBallparkTotal
      : null;
  const hourlyBallpark =
    hourlyBallparkTotal != null && ballparkHours
      ? {
          total: formatValuationMoney(hourlyBallparkTotal),
          core: hourlyBallparkCore!,
          note:
            discount?.hasDiscount && hourlyBallparkOriginalCore != null
              ? `Based on ~${ballparkHours} hours on site plus travel — was ${formatValuationMoney(hourlyBallparkOriginalCore + valuation.premium)} before discount`
              : `Based on ~${ballparkHours} hours on site plus travel — final invoice depends on actual time`,
          originalTotal:
            discount?.hasDiscount && hourlyBallparkOriginalCore != null
              ? formatValuationMoney(hourlyBallparkOriginalCore + valuation.premium)
              : undefined,
        }
      : null;

  const quoteTotal =
    move.quoteType === "hourly"
      ? hourlyBallpark
        ? `${hourlyBallpark.total} ballpark`
        : "Hourly pricing"
      : flatAllIn != null
        ? formatMoney(flatAllIn)
        : formatQuote(displayAmount ?? null, move.quoteType);

  const pricingType =

    move.quoteType === "hourly" ? "Hourly" : move.quoteType === "flat" ? "Flat rate" : "—";

  const pricingTypeKey =

    move.quoteType === "hourly" ? "hourly" : move.quoteType === "flat" ? "flat" : "";

  const quoteAmount =
    displayAmount != null
      ? move.quoteType === "hourly"
        ? formatHourlyRate(displayAmount)
        : flatAllIn != null
          ? formatMoney(flatAllIn)
          : formatMoney(displayAmount)
      : "—";

  const quoteAmountOriginal =
    discount?.hasDiscount && move.quoteAmount != null
      ? move.quoteType === "hourly"
        ? formatHourlyRate(move.quoteAmount)
        : formatMoney(move.quoteAmount)
      : "";

  const ref = move.reference;

  const packingOnQuote =
    move.intake.packingService === "full" || move.intake.packingService === "partial";

  const hourlyLines =
    move.quoteType === "hourly"
      ? buildHourlyPricingLines(move, valuation, defaults.hourlyNotToExceedAmount, discount)
      : [];
  const flatLines =
    move.quoteType === "flat"
      ? buildFlatPricingLines(move, valuation, discount)
      : [];
  const inventoryVolume = inventoryVolumeForMove(move, defaults);

  return {

    company_name: branding.companyName,

    company_phone: company.phone || DEFAULT_DOCUMENT_CONTACT.phone,

    company_email: company.email || DEFAULT_DOCUMENT_CONTACT.email,

    customer_name: move.customerName,

    customer_first_name: customerFirstName(move.customerName),

    shipper_name: moveShipperName(move) || move.customerName,

    move_date: formatMoveDatesDisplay(move),

    origin: move.originAddress || "—",

    destination: move.destinationAddress || "—",

    pricing_type: pricingType,

    pricing_type_key: pricingTypeKey,

    quote_total: quoteTotal,

    quote_amount: quoteAmount,

    quote_amount_original: quoteAmountOriginal,

    has_discount: discount?.hasDiscount ? "yes" : "no",

    discount_reason: discount?.reasonLabel ?? "",

    discount_summary: discount?.summary ?? "",

    discount_amount:
      discount?.hasDiscount ? formatValuationMoney(discount.discountAmount) : "",

    quote_expiry: quoteExpiryDate(move, defaults.quoteValidityDays),

    move_reference: ref,

    deposit_amount: formatMoney(deposit.depositDue),

    balance_due: formatMoney(deposit.balanceDue),

    deposit_quote_basis: String(
      flatAllIn ?? hourlyBallparkTotal ?? deposit.quoteTotal,
    ),

    deposit_is_percent: defaults.depositMode === "percent" ? "yes" : "no",

    deposit_percent: String(defaults.depositValue),

    quote_base_core: flatCore != null ? String(flatCore) : "",

    hourly_ballpark_core:
      hourlyBallparkCore != null ? String(hourlyBallparkCore) : "",

    arrival_window: firstArrivalWindow(move),

    portal_link: `https://portal.movehq.app/${move.id}`,

    deposit_link: `https://pay.movehq.app/deposit/${move.id}`,

    is_regulated_move: valuation.isRegulated ? "yes" : "no",

    liability_coverage_key: valuation.isRegulated
      ? valuation.coverageKey || "released"
      : "none",

    liability_coverage_label: valuation.coverageLabel,

    declared_value:
      valuation.declaredValue != null ? String(valuation.declaredValue) : "",

    liability_premium:
      valuation.premium > 0 ? formatValuationMoney(valuation.premium) : "",

    packing_on_quote: packingOnQuote ? "yes" : "no",

    hourly_lines_json: JSON.stringify(hourlyLines),

    flat_lines_json: JSON.stringify(flatLines),

    inventory_basis_label: formatInventoryBasisLabel(inventoryVolume.basis),

    inventory_volume_display: formatInventoryVolumeDisplay(inventoryVolume),

    hourly_nte_amount:
      move.quoteType === "hourly" && defaults.hourlyNotToExceedAmount > 0
        ? formatValuationMoney(defaults.hourlyNotToExceedAmount)
        : "",

    has_ballpark: hourlyBallpark ? "yes" : "no",

    hourly_ballpark_total: hourlyBallpark?.total ?? "",

    hourly_ballpark_total_original: hourlyBallpark?.originalTotal ?? "",

    hourly_ballpark_note: hourlyBallpark?.note ?? "",

    move_contents_json: serializeMoveContents(buildDocumentMoveContents(move)),

  };

}



export function renderDocumentTemplate(

  body: string,

  vars: Record<string, string>,

): string {

  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);

}



/** Render portal / email rich content (HTML or legacy plain / markdown). */
export function renderPortalRichText(text: string, vars: Record<string, string>): string {
  return renderDocumentRichHtml(text, vars);
}

export function renderEmailRichHtml(text: string, vars: Record<string, string>): string {
  return renderDocumentRichHtml(text, vars);
}



export function defaultSendSubject(move: MoveRecord, kind: DocumentSendKind): string {

  if (kind === "quote") {

    return `Your moving quote — ${move.reference}`;

  }

  return `Moving agreement — ${move.reference} · signature requested`;

}



export function getTemplateForKind(

  templates: DocumentTemplate[],

  kind: DocumentSendKind,

): DocumentTemplate {

  const id = kind === "quote" ? "quote" : "contract";

  return templates.find((t) => t.id === id) ?? templates[0]!;

}



export function videoEmbedUrl(url: string): string | null {

  const trimmed = url.trim();

  if (!trimmed) return null;

  try {

    const u = new URL(trimmed);

    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {

      const id =

        u.searchParams.get("v") ??

        (u.hostname.includes("youtu.be") ? u.pathname.slice(1) : null);

      if (id) return `https://www.youtube.com/embed/${id}`;

    }

    if (u.hostname.includes("vimeo.com")) {

      const id = u.pathname.split("/").filter(Boolean).pop();

      if (id) return `https://player.vimeo.com/video/${id}`;

    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) return trimmed;

  } catch {

    return null;

  }

  return null;

}



export type PortalPreviewInput = {

  portal: DocumentPortalSettings;

  vars: Record<string, string>;

  kind: DocumentSendKind;

  logoDataUrl: string | null;

  accentColor: string;

  companyName: string;

};


