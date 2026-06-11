export type PageMeta = {
  title: string;
  description: string;
};

export const pageMeta: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Dashboard",
    description: "",
  },
  "/calendar": {
    title: "Move Calendar",
    description:
      "Shared calendar for availability, booked moves, Job Days, crew/truck capacity, and conflicts.",
  },
  "/schedule": {
    title: "Schedule",
    description:
      "Office staff calendars from Outlook — your schedule or company-wide, filtered by sales or operations.",
  },
  "/inbox": {
    title: "Inbox",
    description:
      "",
  },
  "/sales/follow-ups": {
    title: "Follow-Ups",
    description:
      "Callbacks and quote follow-ups — overdue first, then due today, sorted by priority.",
  },
  "/sales/web-quotes": {
    title: "AI Web Quotes",
    description:
      "Online flat-rate quotes from your site — incomplete intakes, quoted but not booked, and auto-bookings that need review.",
  },
  "/sales/moves": {
    title: "Moves",
    description: "Pipeline and list — filter by follow-up queue and salesperson.",
  },
  "/sales/walkthroughs": {
    title: "Walkthroughs",
    description:
      "Schedule and track on-site and virtual walkthroughs before quoting.",
  },
  "/sales/directory": {
    title: "Directory",
    description:
      "People and organizations — customers, leads, referral partners (realtors, storage, developers, restoration, and more), and vendors.",
  },
  "/sales/documents": {
    title: "Documents",
    description:
      "Sent quotes and contracts — track views, booking requests, signatures, and deposits.",
  },
  "/operations/jobs": {
    title: "Jobs",
    description:
      "Job days by date plus upcoming ops prep. On Past (and past dates), open field packets for crew forms, signatures, and payment.",
  },
  "/operations/dispatch": {
    title: "Dispatch",
    description: "",
  },
  "/operations/claims": {
    title: "Claims",
    description:
      "Guided claim workflow — see where each file stands, complete steps in order, and close out with payout or denial.",
  },
  "/operations/crew": {
    title: "Crew",
    description:
      "Movers, crew leads, availability, performance, write-ups, and discipline records.",
  },
  "/operations/payroll": {
    title: "Payroll & Time",
    description:
      "Operations approves crew and office hours (tips, mileage, per diem later). Office/HR runs the Rippling CSV export each pay period. Role permissions can split those views later.",
  },
  "/admin/integrations": {
    title: "Integrations",
    description:
      "V1 launch stack — Supabase, Twilio, Outlook, Resend, Stripe, Maps, AI, and monitoring. V2 adds Rippling API, fleet, Gmail, and marketing tags.",
  },
  "/operations/fleet": {
    title: "Fleet",
    description: "Trucks and vehicles — capacity, maintenance, and dispatch assignments.",
  },
  "/operations/inventory": {
    title: "Inventory",
    description:
      "Boxes, packing materials, blankets, and move-day supplies — simple on-hand counts for the ops team.",
  },
  "/operations/reports": {
    title: "Reports",
    description:
      "Day pipeline, sales scorecards, referral partner performance, operations actuals, inventory usage, AI quote accuracy, and dispatch change impact.",
  },
  "/planning": {
    title: "Planning",
    description:
      "MoveHQ roadmap — June office app + Supabase (seed), July live data, August crew + launch.",
  },
  "/admin/staff": {
    title: "Staff",
    description: "",
  },
  "/admin/company": {
    title: "Company",
    description:
      "How the business appears in the product — branding, legal profile, defaults, and notifications.",
  },
  "/admin/setup": {
    title: "Setup",
    description:
      "Operational configuration — pricing, equipment & supplies catalog, statuses, terminology, document templates, automations, and follow-up rules.",
  },
  "/admin/import": {
    title: "Import data",
    description:
      "One-time migration from your old system — upload CSVs for organizations, contacts, moves, job days, claims, and inventory with templates, column mapping, and error reports.",
  },
  "/account": {
    title: "Account",
    description: "Your profile, notifications, email signature, and security settings.",
  },
  "/sign-in": {
    title: "Sign in",
    description: "",
  },
};

export function getPageMeta(href: string): PageMeta | undefined {
  return pageMeta[href];
}
