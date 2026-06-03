import { formatMoveDatesDisplay } from "@/lib/moves/move-dates";

import { formatQuote } from "@/lib/moves/format";

import type { MoveDepositSummary } from "@/lib/moves/move-deposit";

import type { AppSettings, DocumentTemplate } from "@/lib/settings/types";

import type { DocumentPortalSettings } from "@/lib/settings/document-template-types";

import type { MoveRecord } from "./types";
import { renderDocumentRichHtml } from "@/lib/settings/document-rich-text";



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

  const { branding, company, defaults } = settings;

  const quoteTotal = formatQuote(move.quoteAmount, move.quoteType);

  const pricingType =

    move.quoteType === "hourly" ? "Hourly" : move.quoteType === "flat" ? "Flat rate" : "—";

  const ref = move.reference;



  return {

    company_name: branding.companyName,

    company_phone: company.phone || "—",

    company_email: company.email || "—",

    customer_name: move.customerName,

    customer_first_name: customerFirstName(move.customerName),

    move_date: formatMoveDatesDisplay(move),

    origin: move.originAddress || "—",

    destination: move.destinationAddress || "—",

    pricing_type: pricingType,

    quote_total: quoteTotal,

    quote_expiry: quoteExpiryDate(move, defaults.quoteValidityDays),

    move_reference: ref,

    deposit_amount: formatMoney(deposit.depositDue),

    balance_due: formatMoney(deposit.balanceDue),

    arrival_window: firstArrivalWindow(move),

    portal_link: `https://portal.movehq.app/${move.id}`,

    deposit_link: `https://pay.movehq.app/deposit/${move.id}`,

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


