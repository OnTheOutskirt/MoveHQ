export type PageMeta = {
  title: string;
  description: string;
};

export const pageMeta: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Role-based home — executive, manager, sales, or ops view with the KPIs and actions each person needs.",
  },
  "/calendar": {
    title: "Move Calendar",
    description:
      "Shared calendar for availability, booked moves, Job Days, crew/truck capacity, and conflicts.",
  },
  "/inbox": {
    title: "Inbox",
    description:
      "Unified inbox for inbound email, SMS, and calls — tied to Moves and People.",
  },
  "/follow-ups": {
    title: "Follow-Ups",
    description:
      "Callbacks and quote follow-ups — overdue first, then due today, sorted by priority.",
  },
  "/moves": {
    title: "Moves",
    description: "Pipeline and list — filter by follow-up queue and salesperson.",
  },
  "/people": {
    title: "Directory",
    description:
      "People and organizations — customers, leads, referral partners (realtors, storage, developers, restoration, and more), and vendors.",
  },
  "/documents": {
    title: "Documents",
    description:
      "Generated and signed documents for moves — proposals, contracts, confirmations, waivers, and PDFs.",
  },
  "/operations/jobs": {
    title: "Jobs",
    description:
      "Operational Job Days for booked moves — dates, crew, trucks, hours, fieldwork.",
  },
  "/operations/dispatch": {
    title: "Dispatch",
    description: "Daily board for assigning crews and trucks to Job Days.",
  },
  "/operations/crew": {
    title: "Crew",
    description: "Movers, crew leads, availability, and performance.",
  },
  "/operations/trucks": {
    title: "Trucks",
    description: "Fleet capacity, maintenance, and assignments.",
  },
  "/operations/forms": {
    title: "Forms & Fieldwork",
    description: "Checklists, signatures, photos, and move-day documentation.",
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
      "Operational configuration — pricing, statuses and custom fields, and third-party integrations.",
  },
};

export function getPageMeta(href: string): PageMeta | undefined {
  return pageMeta[href];
}
