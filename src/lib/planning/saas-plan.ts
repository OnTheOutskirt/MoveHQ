import type { PlanningGroup } from "./types";

export const SAAS_PLAN_TAB_LABEL = "SaaS";

export type SaasCompetitor = {
  name: string;
  note: string;
  /** What they’re known for — helps compare positioning. */
  strength?: string;
  /** Gaps we believe MoveHQ fills. */
  gap?: string;
};

export const SAAS_COMPETITORS: SaasCompetitor[] = [
  {
    name: "SuperMove",
    note: "Established moving CRM / ops platform.",
    strength: "Brand recognition, sales pipeline.",
    gap: "Less depth on full ops, integrations, and AI-native quoting.",
  },
  {
    name: "Smart Moving",
    note: "Popular among mid-size movers.",
    strength: "Sales and estimating workflows.",
    gap: "Operations, dispatch depth, and modern AI flat-rate from web.",
  },
  {
    name: "MoveIt Pro",
    note: "Long-running moving software.",
    strength: "Familiar to older operators.",
    gap: "Dated UX; weaker on integrations and AI.",
  },
  {
    name: "MoveGistics",
    note: "Moving + logistics positioning.",
    strength: "Multi-service operators.",
    gap: "Not as complete on crew app, comms inbox, and AI quoting.",
  },
  {
    name: "Chariot",
    note: "Newer entrant in moving tech.",
    strength: "Modern UI angle.",
    gap: "Less proven ops coverage and integration breadth.",
  },
];

export const SAAS_DIFFERENTIATORS = [
  "Full operations stack — dispatch, jobs, crew, payroll/time, claims — not just sales CRM.",
  "Unified inbox: SMS, email (Outlook), and customer comms in one place.",
  "Deep integrations: Stripe, Twilio, Microsoft Graph, maps, payroll hooks, AI providers.",
  "AI flat-rate quoting directly from the website — lead → qualified quote without manual re-entry.",
  "Crew mobile app (PWA) tied to dispatch, forms, signatures, and field media.",
  "Multi-location from day one — pricing and workspace model already designed for it.",
  "Built by operators who run a real moving company — product reflects actual workflows.",
] as const;

export const SAAS_PRICING = {
  baseMonthly: 1500,
  additionalLocationMonthly: 500,
  currency: "USD",
  label: "$1,500/month base + $500 per additional location",
  note:
    "Assumes one company account. First location included in base; each extra branch/warehouse/ops location adds $500/mo. Annual prepay discount TBD (e.g. 10–15%).",
} as const;

export type SaasRevenueScenario = {
  id: string;
  customers: number;
  /** Assumes 1 location per customer for simple math. */
  locationsPerCustomer: number;
  monthlyRevenue: number;
  annualRevenue: number;
  label: string;
};

/** Scenarios at base price only (single location per customer). */
export const SAAS_REVENUE_SCENARIOS: SaasRevenueScenario[] = [
  {
    id: "saas-rev-10",
    customers: 10,
    locationsPerCustomer: 1,
    monthlyRevenue: 15_000,
    annualRevenue: 180_000,
    label: "Early traction",
  },
  {
    id: "saas-rev-50",
    customers: 50,
    locationsPerCustomer: 1,
    monthlyRevenue: 75_000,
    annualRevenue: 900_000,
    label: "Regional player",
  },
  {
    id: "saas-rev-100",
    customers: 100,
    locationsPerCustomer: 1,
    monthlyRevenue: 150_000,
    annualRevenue: 1_800_000,
    label: "Category leader path",
  },
];

export type SaasCostLine = {
  role: string;
  lowEstimate: number;
  highEstimate: number;
  period: "month" | "year";
  note: string;
  options?: string;
};

/** Rough planning estimates — refine before hiring. */
export const SAAS_COST_ESTIMATES: SaasCostLine[] = [
  {
    role: "Sales (1 rep)",
    lowEstimate: 0,
    highEstimate: 7_000,
    period: "month",
    note: "Commission-only possible early; base + commission more reliable for full-time hunt.",
    options: "Commission-only (~15–20% of first-year ARR) vs ~$50–70K base + 10–15% commission.",
  },
  {
    role: "Account manager",
    lowEstimate: 0,
    highEstimate: 5_500,
    period: "month",
    note: "May defer until ~20+ customers. Early stage: founder-led onboarding + docs.",
    options: "Hire at 20–30 customers, or bundle light AM into support tier.",
  },
  {
    role: "Support (chat + email)",
    lowEstimate: 500,
    highEstimate: 3_000,
    period: "month",
    note: "In-app chat widget (Intercom/Crisp) + knowledge base before a dedicated hire.",
    options: "Part-time contractor → full-time support at ~50 customers.",
  },
  {
    role: "Ongoing product / engineering",
    lowEstimate: 8_000,
    highEstimate: 25_000,
    period: "month",
    note: "Existing build team continues; budget for SaaS-specific onboarding, billing, and multi-tenant hardening.",
    options: "Keep lean until $30K+ MRR; add contractor or second dev as churn risk drops.",
  },
  {
    role: "Infrastructure & tools",
    lowEstimate: 1_500,
    highEstimate: 8_000,
    period: "month",
    note: "Scales with customer count: Supabase, Vercel, Twilio, AI APIs, support chat, analytics.",
    options: "Target <10% of MRR at scale; monitor per-customer COGS.",
  },
  {
    role: "Marketing (lean)",
    lowEstimate: 1_000,
    highEstimate: 5_000,
    period: "month",
    note: "Conference booth + travel spikes certain months; digital stays always-on but cheap.",
    options: "See marketing channels below — prioritize ROI over spend.",
  },
];

export type SaasMarketingChannel = {
  name: string;
  cost: "low" | "medium" | "high";
  note: string;
  tactics: string[];
};

export const SAAS_MARKETING_CHANNELS: SaasMarketingChannel[] = [
  {
    name: "Moving industry conferences",
    cost: "medium",
    note: "High-intent audience; booth + travel is the main cost. Pick 2–3 per year, not every show.",
    tactics: [
      "IMRG / state moving associations / van-line partner events",
      "Live demo station — AI quote on a tablet in 60 seconds",
      "Collect qualified leads; follow up within 48 hours",
      "Speaking slot or panel = credibility without huge booth spend",
    ],
  },
  {
    name: "Digital — content & SEO",
    cost: "low",
    note: "Slow burn but compounds. Compare MoveHQ vs SuperMove/Smart Moving on honest feature pages.",
    tactics: [
      "“MoveHQ vs …” comparison pages",
      "YouTube: dispatch day, AI flat rate, crew app walkthroughs",
      "Case study from Jonah’s Movers as customer zero",
      "LinkedIn posts from founders — ops pain points, not ads",
    ],
  },
  {
    name: "Product-led & referrals",
    cost: "low",
    note: "Best CAC if the product sells itself after a great onboarding.",
    tactics: [
      "14-day trial or sandbox with seed data",
      "Referral credit ($500/mo off or setup fee waiver)",
      "Partner intros from consultants, coaches, van lines",
      "Free migration checklist from legacy tools",
    ],
  },
  {
    name: "Outbound (targeted)",
    cost: "low",
    note: "Small list of ideal movers (multi-location, $5M+ revenue) — personalized, not spray-and-pray.",
    tactics: [
      "50–100 dream accounts per quarter",
      "Loom demo personalized to their website",
      "Track in lightweight CRM; sales rep owns pipeline",
    ],
  },
];

export const SAAS_PLAN_GROUPS: PlanningGroup[] = [
  {
    id: "saas-positioning",
    title: "Positioning & packaging",
    audienceDescription: "How we describe MoveHQ vs competitors and what we sell.",
    items: [
      {
        id: "saas-positioning-one-liner",
        label: "Write the one-liner: “MoveHQ is …”",
        note: "E.g. all-in-one moving ops + sales platform with AI quoting — for growing local/regional movers.",
      },
      {
        id: "saas-positioning-icp",
        label: "Define ideal customer profile (size, locations, tech maturity)",
        note: "Who converts fastest? 1-location $2–5M? Multi-branch regional?",
      },
      {
        id: "saas-positioning-competitive-matrix",
        label: "Build feature comparison matrix vs top 5 competitors",
      },
      {
        id: "saas-positioning-demo-story",
        label: "Script the 10-minute demo story (web quote → book → dispatch → crew)",
      },
    ],
  },
  {
    id: "saas-pricing-packaging",
    title: "Pricing & contracts",
    audienceDescription: "Finalize list price, discounts, and what’s included.",
    items: [
      {
        id: "saas-pricing-validate-1500",
        label: "Validate $1,500/mo base with 3–5 friendly operators",
        note: "Willingness-to-pay interviews before public pricing page.",
      },
      {
        id: "saas-pricing-location-addon",
        label: "Confirm +$500/additional location rules",
        note: "What counts as a location? Warehouse vs sales office?",
      },
      {
        id: "saas-pricing-annual-discount",
        label: "Annual prepay discount (10–15%?) and contract terms",
      },
      {
        id: "saas-pricing-onboarding-fee",
        label: "One-time onboarding / data migration fee?",
        note: "Optional $2–5K for import + training — or waive for early adopters.",
      },
      {
        id: "saas-pricing-trial",
        label: "Trial structure: 14-day sandbox vs pilot with one branch",
      },
    ],
  },
  {
    id: "saas-gtm-team",
    title: "Sales, success & support",
    audienceDescription: "Who sells, who onboards, who answers tickets.",
    items: [
      {
        id: "saas-gtm-sales-model",
        label: "Decide sales model: commission-only vs base + commission",
        note: "Commission-only lowers fixed burn; base + comm attracts experienced B2B reps.",
      },
      {
        id: "saas-gtm-first-sales-hire",
        label: "Profile first sales hire (moving industry network a plus)",
      },
      {
        id: "saas-gtm-am-vs-support",
        label: "Account manager now or later? (likely after ~20 customers)",
      },
      {
        id: "saas-gtm-support-chat",
        label: "Pick in-app support chat tool + knowledge base",
        note: "Crisp, Intercom, or plain email-to-Slack until volume warrants hire.",
      },
      {
        id: "saas-gtm-onboarding-playbook",
        label: "Customer onboarding playbook (week 1–4 checklist)",
      },
      {
        id: "saas-gtm-sla",
        label: "Support SLA tiers by plan (response time, hours)",
      },
    ],
  },
  {
    id: "saas-marketing",
    title: "Marketing & demand gen",
    audienceDescription: "Low-spend paths to qualified demos.",
    items: [
      {
        id: "saas-mkt-conference-calendar",
        label: "Pick 2–3 moving conferences for next 12 months",
        note: "Budget travel + booth; aim for demo + lead capture.",
      },
      {
        id: "saas-mkt-website-saas",
        label: "Public MoveHQ marketing site (separate from operator login?)",
      },
      {
        id: "saas-mkt-comparison-pages",
        label: "Competitor comparison landing pages (SEO)",
      },
      {
        id: "saas-mkt-case-study",
        label: "Jonah’s Movers case study — customer zero",
      },
      {
        id: "saas-mkt-referral-program",
        label: "Referral / partner program terms",
      },
      {
        id: "saas-mkt-outbound-list",
        label: "Build first 50-account outbound target list",
      },
    ],
  },
  {
    id: "saas-product-readiness",
    title: "Product readiness for SaaS",
    audienceDescription: "Multi-tenant, billing, and polish before selling broadly.",
    items: [
      {
        id: "saas-product-multitenant",
        label: "Multi-tenant isolation audit (data, auth, billing per company)",
      },
      {
        id: "saas-product-billing",
        label: "Stripe Billing / subscription management per location",
      },
      {
        id: "saas-product-self-serve-signup",
        label: "Self-serve signup vs sales-assisted only (phase 1)",
      },
      {
        id: "saas-product-migration",
        label: "Import path from SuperMove / Smart Moving / spreadsheets",
      },
      {
        id: "saas-product-status-page",
        label: "Status page + uptime commitments for SaaS customers",
      },
    ],
  },
];

export function allSaasPlanItemIds(): string[] {
  return SAAS_PLAN_GROUPS.flatMap((g) => g.items.map((i) => i.id));
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
