export type IntegrationPhase = "v1" | "v2";

export type IntegrationCatalogEntry = {
  id: string;
  name: string;
  phase: IntegrationPhase;
  role: string;
  detail: string;
  relatedRoute?: string;
};

/** Third-party vendors from tech stack + roadmaps (not MoveHQ hosting or internal tools). */
export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    id: "twilio",
    name: "Twilio",
    phase: "v1",
    role: "SMS & voice",
    detail: "Company texting, call logging, and click-to-dial from moves.",
    relatedRoute: "/inbox",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    phase: "v1",
    role: "Sales email",
    detail: "Two-way sync with the Inbox via Microsoft Graph.",
    relatedRoute: "/inbox",
  },
  {
    id: "resend",
    name: "Resend",
    phase: "v1",
    role: "System email",
    detail: "Transactional email — receipts and alerts.",
  },
  {
    id: "liveswitch",
    name: "LiveSwitch",
    phase: "v1",
    role: "Voice & video",
    detail: "Evaluate for phones/video; possible LYTX / fleet path.",
  },
  {
    id: "stripe",
    name: "Stripe",
    phase: "v1",
    role: "Card payments",
    detail: "Deposits, balance payments, and saved cards on moves.",
  },
  {
    id: "google-maps",
    name: "Google Maps Platform",
    phase: "v1",
    role: "Maps & addresses",
    detail: "Route embeds, directions, geocoding, and Places autocomplete.",
  },
  {
    id: "website-ai-quote",
    name: "Website AI quote tool",
    phase: "v1",
    role: "Flat-rate quoting",
    detail: "Public website funnel → MoveHQ moves.",
    relatedRoute: "/sales/web-quotes",
  },
  {
    id: "rippling",
    name: "Rippling",
    phase: "v2",
    role: "Payroll & HR",
    detail: "API sync for payroll; until then CSV export from Operations → Payroll & Time.",
    relatedRoute: "/operations/payroll",
  },
  {
    id: "llm-provider",
    name: "OpenAI or Claude",
    phase: "v2",
    role: "LLM APIs",
    detail:
      "Website quoting, draft replies, and in-app assistants — provider TBD (OpenAI, Anthropic Claude, or both).",
  },
  {
    id: "vapi-retell",
    name: "Vapi or Retell",
    phase: "v2",
    role: "Voice AI",
    detail: "Natural voice on Twilio for after-hours phone.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    phase: "v2",
    role: "Web traffic",
    detail: "Who visits the marketing site.",
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    phase: "v2",
    role: "SEO",
    detail: "Search performance for the website.",
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    phase: "v2",
    role: "Tags",
    detail: "Marketing and conversion tracking tags.",
  },
  {
    id: "samsara",
    name: "Samsara",
    phase: "v2",
    role: "Fleet tracking",
    detail: "GPS, dash cams, and vehicle telematics — research for LYTX replacement and live fleet status.",
    relatedRoute: "/operations/fleet",
  },
];
