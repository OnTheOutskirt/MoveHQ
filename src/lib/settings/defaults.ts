import type { AppSettings, DocumentTemplate, DocumentTemplateType } from "./types";

export const defaultSettings: AppSettings = {
  branding: {
    companyName: "Jonah's Movers",
    productName: "MoveHQ",
    logoDataUrl: null,
    accentColor: "#2563eb",
    sidebarColor: "#0f172a",
  },
  company: {
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    website: "",
    timezone: "America/Denver",
  },
  defaults: {
    depositPercent: 25,
    quoteValidityDays: 14,
    businessHoursStart: "07:00",
    businessHoursEnd: "18:00",
    defaultPricingType: "flat_rate",
  },
};

const TEMPLATE_META: Record<
  DocumentTemplateType,
  { name: string; description: string; body: string }
> = {
  quote: {
    name: "Quote",
    description: "Sent to customers after pricing is prepared.",
    body: `QUOTE — {{company_name}}

Prepared for: {{customer_name}}
Move date: {{move_date}}
Origin: {{origin}}
Destination: {{destination}}

Pricing type: {{pricing_type}}
Total: {{quote_total}}

Valid until: {{quote_expiry}}

Thank you for considering {{company_name}}.`,
  },
  contract: {
    name: "Contract",
    description: "Binding agreement before booking is confirmed.",
    body: `MOVING SERVICES AGREEMENT

Customer: {{customer_name}}
Move reference: {{move_reference}}

{{company_name}} agrees to perform moving services as described in the attached quote.

Deposit: {{deposit_amount}}
Balance due: {{balance_due}}

Signature: _________________________  Date: __________`,
  },
  proposal: {
    name: "Proposal",
    description: "Sales proposal with scope and pricing summary.",
    body: `PROPOSAL — {{move_reference}}

Dear {{customer_name}},

We are pleased to present this proposal for your upcoming move.

Scope includes: loading, transport, and unloading per the quoted plan.

Contact: {{company_phone}} | {{company_email}}`,
  },
  confirmation: {
    name: "Booking Confirmation",
    description: "Sent after deposit is collected and move is booked.",
    body: `BOOKING CONFIRMED

Hi {{customer_name}},

Your move is booked for {{move_date}}.
Arrival window: {{arrival_window}}

Crew lead will contact you before job day.`,
  },
  waiver: {
    name: "Waiver",
    description: "Liability and terms acknowledgment on move day.",
    body: `LIABILITY WAIVER

I, {{customer_name}}, acknowledge the terms of service for move {{move_reference}}.

Customer signature: _________________________
Date: __________`,
  },
};

export function defaultDocumentTemplates(): DocumentTemplate[] {
  const now = new Date().toISOString();
  return (Object.keys(TEMPLATE_META) as DocumentTemplateType[]).map((id) => ({
    id,
    ...TEMPLATE_META[id],
    updatedAt: now,
  }));
}
