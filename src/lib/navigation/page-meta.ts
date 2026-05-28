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
    title: "Web flat-rate quotes",
    description:
      "Online flat-rate quotes from your site — incomplete intakes, quoted but not booked, and auto-bookings that need review.",
  },
  "/sales/moves": {
    title: "Moves",
    description: "Pipeline and list — filter by follow-up queue and salesperson.",
  },
  "/sales/directory": {
    title: "Directory",
    description:
      "People and organizations — customers, leads, referral partners (realtors, storage, developers, restoration, and more), and vendors.",
  },
  "/sales/documents": {
    title: "Documents",
    description:
      "Generated and signed documents for moves — proposals, contracts, confirmations, waivers, and PDFs.",
  },
  "/operations/jobs": {
    title: "Jobs",
    description:
      "Job days by date plus upcoming ops prep — hotels, vendors, materials, and logistics from move scope.",
  },
  "/operations/dispatch": {
    title: "Dispatch",
    description: "Daily board for assigning crews and trucks to Job Days.",
  },
  "/operations/claims": {
    title: "Claims",
    description:
      "Customer claims and damage resolution — track status, dollar amounts, and ties to moves.",
  },
  "/operations/crew": {
    title: "Crew",
    description: "Movers, crew leads, availability, and performance.",
  },
  "/operations/payroll": {
    title: "Payroll & Time",
    description:
      "Operations approves crew and office hours (tips, mileage, per diem later). Office/HR runs the Rippling CSV export each pay period. Role permissions can split those views later.",
  },
  "/admin/integrations": {
    title: "Integrations",
    description:
      "Third-party services — Twilio, Outlook, Stripe, Rippling, maps, website tools, and V2 AI. Planned go-live order (not wired live yet).",
  },
  "/operations/fleet": {
    title: "Fleet",
    description: "Trucks and vehicles — capacity, maintenance, and dispatch assignments.",
  },
  "/operations/forms": {
    title: "Field Forms",
    description: "Checklists, signatures, photos, and move-day documentation from the crew app.",
  },
  "/operations/reports": {
    title: "Reports",
    description: "Sales pipeline, revenue, and operations reporting — day, week, and summary views.",
  },
  "/planning": {
    title: "Planning",
    description:
      "MoveHQ roadmap — June office app + Supabase (seed), July live data, August crew + launch.",
  },
  "/admin/staff": {
    title: "Staff",
    description:
      "Employees and contractors — roster, permission roles, software and crew app access, and pay.",
  },
  "/admin/company": {
    title: "Company",
    description:
      "How the business appears in the product — branding, legal profile, defaults, and notifications.",
  },
  "/admin/templates": {
    title: "Templates",
    description:
      "Customer-facing document templates for quotes, contracts, proposals, confirmations, and waivers.",
  },
  "/admin/setup": {
    title: "Setup",
    description:
      "Operational configuration — pricing and statuses/custom fields. Third-party integrations live under Integrations.",
  },
};

export function getPageMeta(href: string): PageMeta | undefined {
  return pageMeta[href];
}
