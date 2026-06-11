export type IntegrationPhase = "v1" | "v2";

export type IntegrationCategory =
  | "platform"
  | "comms"
  | "payments"
  | "maps"
  | "ai"
  | "observability"
  | "hr"
  | "fleet"
  | "marketing";

export type IntegrationCatalogEntry = {
  id: string;
  name: string;
  phase: IntegrationPhase;
  category: IntegrationCategory;
  role: string;
  detail: string;
  relatedRoute?: string;
};

export type IntegrationSection = {
  id: string;
  label: string;
  description: string;
  entryIds: string[];
};

/** Third-party vendors to connect for go-live (not MoveHQ app code itself). */
export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    id: "supabase",
    name: "Supabase",
    phase: "v1",
    category: "platform",
    role: "Database & auth",
    detail:
      "Postgres for moves, people, messages, and payments — plus staff login, row-level security, and file storage.",
    relatedRoute: "/admin/staff",
  },
  {
    id: "twilio",
    name: "Twilio",
    phase: "v1",
    category: "comms",
    role: "SMS & voice",
    detail: "Company texting, call logging, click-to-dial, and automation SMS sequences.",
    relatedRoute: "/inbox",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    phase: "v1",
    category: "comms",
    role: "Sales email",
    detail: "Two-way Inbox sync via Microsoft Graph — staff keep using Outlook normally.",
    relatedRoute: "/inbox",
  },
  {
    id: "resend",
    name: "Resend",
    phase: "v1",
    category: "comms",
    role: "System email",
    detail: "Transactional email — quote/contract sends, receipts, and staff alert digests.",
    relatedRoute: "/admin/company",
  },
  {
    id: "liveswitch",
    name: "LiveSwitch",
    phase: "v1",
    category: "comms",
    role: "Video walkthroughs",
    detail:
      "Virtual walkthroughs and customer self-film links — evaluate alongside Twilio; backup to in-house video.",
    relatedRoute: "/sales/walkthroughs",
  },
  {
    id: "stripe",
    name: "Stripe",
    phase: "v1",
    category: "payments",
    role: "Card payments",
    detail: "Booking deposits, balance due, saved cards, and customer portal checkout.",
    relatedRoute: "/portal/preview",
  },
  {
    id: "google-maps",
    name: "Google Maps Platform",
    phase: "v1",
    category: "maps",
    role: "Maps & addresses",
    detail: "Route embeds on moves and dispatch, directions, geocoding, and Places autocomplete.",
    relatedRoute: "/schedule",
  },
  {
    id: "website-ai-quote",
    name: "Website AI quote",
    phase: "v1",
    category: "ai",
    role: "Web lead intake",
    detail: "Public website flat-rate funnel → qualified leads and moves in MoveHQ.",
    relatedRoute: "/sales/web-quotes",
  },
  {
    id: "llm-provider",
    name: "OpenAI or Claude",
    phase: "v1",
    category: "ai",
    role: "AI / LLM",
    detail:
      "Website quoting, intake assists, note summaries, and media analysis — one provider config for V1.",
    relatedRoute: "/admin/setup",
  },
  {
    id: "sentry",
    name: "Sentry",
    phase: "v1",
    category: "observability",
    role: "Error monitoring",
    detail: "Production error alerts and performance traces before and after September launch.",
  },
  {
    id: "rippling",
    name: "Rippling",
    phase: "v2",
    category: "hr",
    role: "Payroll & HR API",
    detail:
      "API sync for payroll and time — until then use Rippling-compatible CSV export from Payroll & Time.",
    relatedRoute: "/operations/payroll",
  },
  {
    id: "gmail",
    name: "Gmail",
    phase: "v2",
    category: "comms",
    role: "Sales email",
    detail: "Google Workspace inbox sync — planned alongside Outlook.",
    relatedRoute: "/inbox",
  },
  {
    id: "website-chatbot",
    name: "Website chatbot",
    phase: "v2",
    category: "ai",
    role: "Customer chat",
    detail: "AI chat on the marketing site for leads and FAQs — builds on V1 LLM integration.",
  },
  {
    id: "vapi-retell",
    name: "Vapi or Retell",
    phase: "v2",
    category: "comms",
    role: "Voice AI",
    detail: "Natural voice on Twilio for after-hours phone and overflow.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    phase: "v2",
    category: "marketing",
    role: "Web traffic",
    detail: "Marketing site visits and conversion funnels.",
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    phase: "v2",
    category: "marketing",
    role: "SEO",
    detail: "Search performance for the marketing website.",
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    phase: "v2",
    category: "marketing",
    role: "Tags",
    detail: "Marketing and conversion tracking pixels without code deploys.",
  },
  {
    id: "samsara",
    name: "Samsara",
    phase: "v2",
    category: "fleet",
    role: "Fleet tracking",
    detail:
      "GPS, dash cams, and vehicle telematics — research for LYTX replacement and live fleet status.",
    relatedRoute: "/operations/fleet",
  },
];

const catalogById = new Map(INTEGRATION_CATALOG.map((e) => [e.id, e]));

/** V1 groups for the admin Integrations page — matches roadmap go-live order. */
export const V1_INTEGRATION_SECTIONS: IntegrationSection[] = [
  {
    id: "platform",
    label: "Platform & data",
    description: "Core backend before customer-facing comms and payments.",
    entryIds: ["supabase", "sentry"],
  },
  {
    id: "comms",
    label: "Texts, email & video",
    description: "Real two-way comms in the Inbox — your team stays in control in V1.",
    entryIds: ["twilio", "outlook", "resend", "liveswitch"],
  },
  {
    id: "payments",
    label: "Payments",
    description: "Deposits and balance collection through the customer portal.",
    entryIds: ["stripe"],
  },
  {
    id: "maps",
    label: "Maps & routing",
    description: "Addresses, routes, and drive context across moves and dispatch.",
    entryIds: ["google-maps"],
  },
  {
    id: "ai",
    label: "AI & website leads",
    description: "Web intake and lightweight in-app assists — not auto-reply comms (that's V2).",
    entryIds: ["website-ai-quote", "llm-provider"],
  },
];

export const V2_INTEGRATION_SECTIONS: IntegrationSection[] = [
  {
    id: "comms-v2",
    label: "Smarter comms",
    description: "Gmail sync and voice AI on top of the V1 Twilio foundation.",
    entryIds: ["gmail", "vapi-retell", "website-chatbot"],
  },
  {
    id: "ops-v2",
    label: "Operations & HR",
    description: "Payroll API and fleet telematics when the business is ready.",
    entryIds: ["rippling", "samsara"],
  },
  {
    id: "marketing-v2",
    label: "Marketing analytics",
    description: "Website traffic, SEO, and tag management.",
    entryIds: ["google-analytics", "google-search-console", "google-tag-manager"],
  },
];

export function integrationEntry(id: string): IntegrationCatalogEntry | undefined {
  return catalogById.get(id);
}

export function integrationsForSection(section: IntegrationSection): IntegrationCatalogEntry[] {
  return section.entryIds
    .map((id) => catalogById.get(id))
    .filter((e): e is IntegrationCatalogEntry => e != null);
}
