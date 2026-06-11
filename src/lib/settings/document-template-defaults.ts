import type {
  DocumentPortalSettings,
  DocumentTemplate,
  DocumentTemplateType,
} from "./document-template-types";
import { DOCUMENT_TEMPLATE_TYPES } from "./document-template-types";
import {
  DEFAULT_FLAT_RATE_TERMS,
  DEFAULT_HOURLY_TERMS,
} from "./document-terms-defaults";
import {
  sampleDocumentMoveContents,
  serializeMoveContents,
} from "./document-move-contents";

export const DEFAULT_PORTAL_ACCENT = "#1b4d8e";

export type MergeFieldGroup = "Company" | "Customer" | "Move" | "Pricing" | "Links";

export type DocumentMergeField = {
  key: string;
  label: string;
  group: MergeFieldGroup;
  description?: string;
  /** Inserted as HTML in portal preview only — not a merge token. */
  portalOnly?: boolean;
};

export const DOCUMENT_MERGE_FIELDS: DocumentMergeField[] = [
  { key: "company_name", label: "Company name", group: "Company" },
  { key: "company_phone", label: "Company phone", group: "Company" },
  { key: "company_email", label: "Company email", group: "Company" },
  { key: "customer_name", label: "Customer name", group: "Customer" },
  { key: "customer_first_name", label: "Customer first name", group: "Customer" },
  {
    key: "shipper_name",
    label: "Shipper name",
    group: "Customer",
    description: "Household / shipper on the agreement",
  },
  { key: "move_reference", label: "Move reference", group: "Move" },
  { key: "move_date", label: "Move date(s)", group: "Move" },
  { key: "origin", label: "Origin address", group: "Move" },
  { key: "destination", label: "Destination address", group: "Move" },
  { key: "arrival_window", label: "Arrival window", group: "Move" },
  { key: "pricing_type", label: "Pricing type", group: "Pricing" },
  {
    key: "pricing_type_key",
    label: "Pricing type key",
    group: "Pricing",
    description: "flat or hourly — used for portal layout",
  },
  {
    key: "quote_total",
    label: "Quote total",
    group: "Pricing",
    description: "Flat: all-in total. Hourly: ballpark total when available, otherwise “Hourly pricing”.",
  },
  {
    key: "quote_amount",
    label: "Quote amount (number only)",
    group: "Pricing",
    description: "Flat: move total. Hourly: labor rate per hour (shown in line-item breakdown, not the document hero).",
  },
  {
    key: "quote_amount_original",
    label: "Quote amount before discount",
    group: "Pricing",
    description: "Original rate or flat total when a discount is applied",
  },
  {
    key: "has_discount",
    label: "Has discount (yes/no)",
    group: "Pricing",
  },
  {
    key: "discount_reason",
    label: "Discount reason",
    group: "Pricing",
  },
  {
    key: "discount_summary",
    label: "Discount summary",
    group: "Pricing",
    description: "e.g. 10% — Repeat customer (−$240)",
  },
  {
    key: "discount_amount",
    label: "Discount amount",
    group: "Pricing",
    description: "Dollar savings from the discount",
  },
  { key: "quote_expiry", label: "Quote valid until", group: "Pricing" },
  { key: "deposit_amount", label: "Deposit amount", group: "Pricing" },
  { key: "balance_due", label: "Balance due", group: "Pricing" },
  {
    key: "hourly_ballpark_total",
    label: "Hourly ballpark total",
    group: "Pricing",
    description: "Optional estimated total for hourly moves",
  },
  {
    key: "hourly_ballpark_note",
    label: "Hourly ballpark note",
    group: "Pricing",
    description: "Short explanation under the ballpark figure",
  },
  {
    key: "hourly_nte_amount",
    label: "Hourly not-to-exceed amount",
    group: "Pricing",
    description: "NTE ceiling formatted for hourly quotes",
  },
  {
    key: "inventory_basis_label",
    label: "Inventory basis label",
    group: "Pricing",
    description: "Cubic feet or Weight",
  },
  {
    key: "inventory_volume_display",
    label: "Inventory volume",
    group: "Pricing",
    description: "Estimated cu ft or lbs for flat-rate moves",
  },
  {
    key: "portal_link",
    label: "Customer portal link",
    group: "Links",
    description: "Link to view quote or sign contract online",
  },
  {
    key: "deposit_link",
    label: "Deposit payment link",
    group: "Links",
    description: "Stripe payment link when enabled",
  },
];

export function mergeFieldToken(key: string): string {
  return `{{${key}}}`;
}

const QUOTE_EMAIL = {
  subject: "Your moving quote — {{move_reference}}",
  body: `Hi {{customer_first_name}},

Your personalized moving quote is ready. Open the link below to review pricing, watch a short welcome video, and book when you're ready.

{{portal_link}}

Questions? Call us at {{company_phone}} or reply to this email.

Thank you,
{{company_name}}`,
};

const QUOTE_PORTAL: DocumentPortalSettings = {
  headline: "Your moving quote",
  intro:
    "Hi {{customer_first_name}} — {{company_name}} has prepared your estimate for {{move_date}}. Review the details below and let us know when you're ready.",
  mainContent: `**Move details**

**Shipper:** {{shipper_name}}
**Move date:** {{move_date}}
**From:** {{origin}}
**To:** {{destination}}
**Arrival window:** {{arrival_window}}

Questions about scope or timing? Call {{company_phone}} or reply here — we're happy to help before you book.`,
  footerNote:
    "Questions? Call {{company_phone}} or email {{company_email}}.",
  termsHourly: DEFAULT_HOURLY_TERMS,
  termsFlat: DEFAULT_FLAT_RATE_TERMS,
  bookingCardChargeAcknowledgment:
    "I understand that if I book this move, {{company_name}} may charge my card on file for the deposit (when applicable) and the remaining balance after my move is completed, as described in the moving agreement.",
  videoUrl: "",
  showPricingSummary: true,
  showFlatBreakdown: true,
  showContents: true,
  showDepositLine: true,
  showTerms: true,
  showValuation: true,
  unregulatedValuationDisplay: "notice",
  showSignatureBlock: false,
};

const CONTRACT_EMAIL = {
  subject: "Please sign your moving agreement — {{move_reference}}",
  body: `Hi {{customer_first_name}},

Your move is almost on the calendar. Review and sign the agreement at the link below, then submit your deposit to secure {{move_date}}.

{{portal_link}}

Deposit due today: {{deposit_amount}}

Thank you,
{{company_name}}`,
};

const CONTRACT_PORTAL: DocumentPortalSettings = {
  headline: "Your moving agreement",
  intro:
    "{{customer_first_name}}, please review and sign below to confirm your move with {{company_name}} on {{move_date}}.",
  mainContent: `**Move details**

**Shipper:** {{shipper_name}}
**Move date:** {{move_date}}
**From:** {{origin}}
**To:** {{destination}}
**Arrival window:** {{arrival_window}}

By signing, you authorize {{company_name}} to perform the services described in your quote and accept the valuation terms selected for this move.`,
  footerNote: "Need a change before signing? Contact {{company_email}} or {{company_phone}}.",
  termsHourly: DEFAULT_HOURLY_TERMS,
  termsFlat: DEFAULT_FLAT_RATE_TERMS,
  bookingCardChargeAcknowledgment:
    "I understand that if I book this move, {{company_name}} may charge my card on file for the deposit (when applicable) and the remaining balance after my move is completed, as described in the moving agreement.",
  videoUrl: "",
  showPricingSummary: true,
  showFlatBreakdown: true,
  showContents: true,
  showDepositLine: true,
  showTerms: true,
  showValuation: true,
  unregulatedValuationDisplay: "notice",
  showSignatureBlock: true,
};

const META: Record<
  DocumentTemplateType,
  Pick<DocumentTemplate, "name" | "description"> & {
    email: typeof QUOTE_EMAIL;
    portal: DocumentPortalSettings;
  }
> = {
  quote: {
    name: "Quote",
    description: "Email + customer portal page sent after pricing is prepared.",
    email: QUOTE_EMAIL,
    portal: QUOTE_PORTAL,
  },
  contract: {
    name: "Contract",
    description: "Email + portal page for e-sign and deposit before booking.",
    email: CONTRACT_EMAIL,
    portal: CONTRACT_PORTAL,
  },
};

const DEFAULT_ACCENT: Record<DocumentTemplateType, string | null> = {
  quote: DEFAULT_PORTAL_ACCENT,
  contract: DEFAULT_PORTAL_ACCENT,
};

export function defaultDocumentTemplate(id: DocumentTemplateType): DocumentTemplate {
  const meta = META[id];
  return {
    id,
    name: meta.name,
    description: meta.description,
    accentColor: DEFAULT_ACCENT[id],
    email: { ...meta.email },
    portal: { ...meta.portal },
    updatedAt: new Date().toISOString(),
  };
}

export function defaultDocumentTemplates(): DocumentTemplate[] {
  return DOCUMENT_TEMPLATE_TYPES.map((id) => defaultDocumentTemplate(id));
}

/** Sample values for Setup preview (no move required). */
export function sampleDocumentVars(companyName = "Jonah's Movers"): Record<string, string> {
  return {
    company_name: companyName,
    company_phone: "(832) 728-6675",
    company_email: "info@jonahsmovers.com",
    customer_name: "Jane Miller",
    customer_first_name: "Jane",
    shipper_name: "Jane & Tom Miller",
    move_reference: "JM-1042",
    move_date: "June 15, 2026",
    origin: "1842 Lakeview Dr, Lakewood, OH",
    destination: "8921 Clifton Blvd, Cleveland, OH",
    arrival_window: "8:00 – 10:00 AM",
    pricing_type: "Flat rate",
    pricing_type_key: "flat",
    quote_total: "$2,450 flat",
    quote_amount: "$2,450",
    quote_amount_original: "",
    has_discount: "no",
    discount_reason: "",
    discount_summary: "",
    discount_amount: "",
    quote_expiry: "June 22, 2026",
    deposit_amount: "$100",
    balance_due: "$2,350",
    portal_link: "https://portal.movehq.app/view/JM-1042",
    deposit_link: "https://pay.movehq.app/deposit/JM-1042",
    is_regulated_move: "yes",
    liability_coverage_key: "full",
    liability_coverage_label: "Full Value Protection",
    declared_value: "48500",
    liability_premium: "$728",
    packing_on_quote: "no",
    hourly_lines_json: "[]",
    has_ballpark: "no",
    hourly_ballpark_total: "",
    hourly_ballpark_note: "",
    move_contents_json: serializeMoveContents(sampleDocumentMoveContents()),
  };
}
