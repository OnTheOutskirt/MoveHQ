import type {
  DocumentPortalSettings,
  DocumentTemplate,
  DocumentTemplateType,
} from "./document-template-types";
import { DOCUMENT_TEMPLATE_TYPES } from "./document-template-types";

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
  { key: "move_reference", label: "Move reference", group: "Move" },
  { key: "move_date", label: "Move date(s)", group: "Move" },
  { key: "origin", label: "Origin address", group: "Move" },
  { key: "destination", label: "Destination address", group: "Move" },
  { key: "arrival_window", label: "Arrival window", group: "Move" },
  { key: "pricing_type", label: "Pricing type", group: "Pricing" },
  { key: "quote_total", label: "Quote total", group: "Pricing" },
  { key: "quote_expiry", label: "Quote valid until", group: "Pricing" },
  { key: "deposit_amount", label: "Deposit amount", group: "Pricing" },
  { key: "balance_due", label: "Balance due", group: "Pricing" },
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
    "Hi {{customer_first_name}} — thanks for choosing {{company_name}}. Review your estimate below and let us know when you'd like to book.",
  mainContent: `We've prepared a {{pricing_type}} quote for your move on {{move_date}}.

**From:** {{origin}}
**To:** {{destination}}

This quote is valid until {{quote_expiry}}. Your deposit to hold the date is {{deposit_amount}}.`,
  footerNote:
    "Questions? Call {{company_phone}} or email {{company_email}}. We're happy to adjust scope before you sign.",
  videoUrl: "",
  showPricingSummary: true,
  showDepositLine: true,
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
  headline: "Moving services agreement",
  intro:
    "{{company_name}} and {{customer_name}} agree to the terms below for move {{move_reference}} on {{move_date}}.",
  mainContent: `**Service addresses**
Origin: {{origin}}
Destination: {{destination}}

**Pricing**
Quote total: {{quote_total}} ({{pricing_type}})
Deposit due to book: {{deposit_amount}}
Balance due on completion: {{balance_due}}

By signing, you authorize {{company_name}} to perform the services described in your quote and accept standard valuation terms.`,
  footerNote: "Need changes before signing? Contact {{company_email}} or {{company_phone}}.",
  videoUrl: "",
  showPricingSummary: true,
  showDepositLine: true,
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

export function defaultDocumentTemplate(id: DocumentTemplateType): DocumentTemplate {
  const meta = META[id];
  return {
    id,
    name: meta.name,
    description: meta.description,
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
    company_phone: "(216) 555-0100",
    company_email: "hello@jonahsmovers.com",
    customer_name: "Jane Miller",
    customer_first_name: "Jane",
    move_reference: "JM-1042",
    move_date: "June 15, 2026",
    origin: "1842 Lakeview Dr, Lakewood, OH",
    destination: "8921 Clifton Blvd, Cleveland, OH",
    arrival_window: "8:00 – 10:00 AM",
    pricing_type: "Flat rate",
    quote_total: "$2,450",
    quote_expiry: "June 22, 2026",
    deposit_amount: "$100",
    balance_due: "$2,350",
    portal_link: "https://portal.movehq.app/view/JM-1042",
    deposit_link: "https://pay.movehq.app/deposit/JM-1042",
  };
}
