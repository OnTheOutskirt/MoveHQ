export type IntegrationStatus = "planned" | "v2" | "not_started";

export type IntegrationCatalogEntry = {
  id: string;
  name: string;
  status: IntegrationStatus;
  role: string;
  detail: string;
  relatedRoute?: string;
};

export const INTEGRATION_STATUS_LABELS: Record<
  IntegrationStatus,
  { label: string; badge: string }
> = {
  planned: {
    label: "V1 planned",
    badge: "bg-brand-100 text-brand-900",
  },
  v2: {
    label: "V2 roadmap",
    badge: "bg-violet-100 text-violet-900",
  },
  not_started: {
    label: "Not started",
    badge: "bg-slate-100 text-slate-600",
  },
};

/** Third-party vendors from tech stack + roadmaps (not MoveHQ hosting or internal tools). */
export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    id: "twilio",
    name: "Twilio",
    status: "planned",
    role: "SMS & voice",
    detail: "Company texting, call logging, and click-to-dial from moves.",
    relatedRoute: "/inbox",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    status: "planned",
    role: "Sales email",
    detail: "Two-way sync with the Inbox via Microsoft Graph.",
    relatedRoute: "/inbox",
  },
  {
    id: "resend",
    name: "Resend",
    status: "planned",
    role: "System email",
    detail: "Transactional email — receipts and alerts.",
  },
  {
    id: "liveswitch",
    name: "LiveSwitch",
    status: "planned",
    role: "Voice & video",
    detail: "Evaluate for phones/video; possible LYTX / fleet path.",
  },
  {
    id: "stripe",
    name: "Stripe",
    status: "planned",
    role: "Card payments",
    detail: "Deposits, balance payments, and saved cards on moves.",
  },
  {
    id: "google-maps",
    name: "Google Maps Platform",
    status: "planned",
    role: "Maps & addresses",
    detail: "Route embeds, directions, geocoding, and Places autocomplete.",
  },
  {
    id: "website-ai-quote",
    name: "Website AI quote tool",
    status: "planned",
    role: "Flat-rate quoting",
    detail: "Public website funnel → MoveHQ moves.",
    relatedRoute: "/sales/web-quotes",
  },
  {
    id: "rippling",
    name: "Rippling",
    status: "v2",
    role: "Payroll & HR",
    detail: "API sync for payroll; until then CSV export from Operations → Payroll & Time.",
    relatedRoute: "/operations/payroll",
  },
  {
    id: "llm-provider",
    name: "OpenAI or Claude",
    status: "v2",
    role: "LLM APIs",
    detail:
      "Website quoting, draft replies, and in-app assistants — provider TBD (OpenAI, Anthropic Claude, or both).",
  },
  {
    id: "vapi-retell",
    name: "Vapi or Retell",
    status: "v2",
    role: "Voice AI",
    detail: "Natural voice on Twilio for after-hours phone.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    status: "v2",
    role: "Web traffic",
    detail: "Who visits the marketing site.",
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    status: "v2",
    role: "SEO",
    detail: "Search performance for the website.",
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    status: "v2",
    role: "Tags",
    detail: "Marketing and conversion tracking tags.",
  },
  {
    id: "samsara",
    name: "Samsara",
    status: "v2",
    role: "Fleet tracking",
    detail: "GPS, dash cams, and vehicle telematics — research for LYTX replacement and live fleet status.",
    relatedRoute: "/operations/fleet",
  },
];
