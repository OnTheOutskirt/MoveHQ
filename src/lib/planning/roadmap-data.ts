import { V1_GROUPS, V2_GROUPS } from "./roadmap-groups";
import type { GanttBar, GanttMilestone, TimelineRow } from "./types";

export { V1_GROUPS, V2_GROUPS };

export const V1_DEADLINE = "2026-09-01";
export const V1_LAUNCH_LABEL = "September 1, 2026";
export const PLAN_START = "2026-06-01";
export const PLAN_END = "2026-08-31";

export const PRODUCT_NAME = "MoveHQ";
export const PRODUCT_TAGLINE =
  "One system for the office, sales, scheduling, and crew on move day";

export type TechStackEntry = {
  name: string;
  role: string;
  detail: string;
  builderDetail?: string;
  phase: "v1" | "v2";
};

export const TECH_STACK: TechStackEntry[] = [
  {
    name: "MoveHQ app",
    role: "The software you log into",
    detail: "Runs in the web browser for the office and installs like an app on crew phones.",
    builderDetail: "Next.js — web app + PWA crew shell",
    phase: "v1",
  },
  {
    name: "Supabase",
    role: "Where all your data is stored",
    detail: "Moves, customers, messages, payments, and staff accounts live here securely.",
    builderDetail: "Postgres + auth + row-level security",
    phase: "v1",
  },
  {
    name: "Vercel",
    role: "Where the live website runs",
    detail:
      "Hosts MoveHQ on the web — production at app.jonahsmovers.com (or similar), plus preview URLs before go-live.",
    builderDetail: "Hosting, preview deploys, production",
    phase: "v1",
  },
  {
    name: "Resend",
    role: "System emails",
    detail: "Sends receipts, notifications, and alerts — not your personal Outlook.",
    builderDetail: "Transactional email API",
    phase: "v1",
  },
  {
    name: "Microsoft Outlook",
    role: "Sales email in the Inbox",
    detail: "Two-way sync so emails in Outlook also show in MoveHQ on the move.",
    builderDetail: "Microsoft Graph API",
    phase: "v1",
  },
  {
    name: "Twilio",
    role: "Company texting & phone backbone",
    detail:
      "V1: real two-way SMS and call logging. V2: AI can answer after hours and help reply to texts.",
    builderDetail: "SMS, voice, numbers, webhooks",
    phase: "v1",
  },
  {
    name: "Stripe",
    role: "Card payments",
    detail: "Deposits, paying the balance, and charging a saved card when the move is done.",
    builderDetail: "Stripe Connect, PaymentIntents, saved PM",
    phase: "v1",
  },
  {
    name: "Google Maps Platform",
    role: "Maps, routes & addresses",
    detail:
      "Route maps on moves and job days, driving directions between stops, geocoding, and Places autocomplete for addresses.",
    builderDetail:
      "Maps JavaScript API, Directions API, Geocoding API, Places API (API key in env)",
    phase: "v1",
  },
  {
    name: "LiveSwitch",
    role: "Voice & video platform (V1 planning)",
    detail:
      "Unified comms layer for phones and video — evaluate alongside Twilio and as a path beyond legacy LYTX.",
    builderDetail: "LiveSwitch API — integration scope TBD with ops",
    phase: "v1",
  },
  {
    name: "OpenAI",
    role: "Smart assistants (V2)",
    detail: "Helps write replies and power after-hours phone — not replacing your team in V1.",
    builderDetail: "GPT APIs for comms + ops assist",
    phase: "v2",
  },
  {
    name: "Vapi or Retell",
    role: "Natural phone voice (V2)",
    detail: "Makes after-hours phone answering sound human; works with Twilio.",
    builderDetail: "Voice AI orchestration on Twilio",
    phase: "v2",
  },
  {
    name: "Rippling",
    role: "Payroll & HR (V2)",
    detail: "Payroll, time tracking, and HR data when the business is ready to connect MoveHQ.",
    builderDetail: "Rippling API — payroll & time sync",
    phase: "v2",
  },
  {
    name: "Samsara",
    role: "Fleet tracking (V2)",
    detail:
      "GPS, dash cams, and vehicle telematics — potential LYTX replacement and live truck status in MoveHQ.",
    builderDetail: "Samsara API — fleet telematics & safety",
    phase: "v2",
  },
];

/** How phone, SMS, and AI comms roll out across versions. */
export const COMMS_ROADMAP = {
  v1: {
    title: "V1 — Real texting & email (your team in control)",
    items: [
      "Company text numbers customers can reach",
      "Incoming and outgoing texts in the Inbox, tied to each move",
      "Send texts from a move or from automated follow-up sequences",
      "Log calls and click to dial from a move",
      "Outlook email syncs both ways — staff reply normally",
      "Foundation in place for smarter automation in V2",
    ],
  },
  v2: {
    title: "V2 — AI helps on phone, text, and email",
    items: [
      "After hours, AI can answer the phone and take a message or route urgent calls",
      "Busy lines go to voicemail with a written summary on the move",
      "AI can draft or auto-send texts with rules; staff can take over anytime",
      "AI can suggest or auto-send emails synced with Outlook",
      "AI uses move details and recent messages so answers make sense",
    ],
  },
} as const;

/** Month summaries for Overall Plan phase cards. */
export const V1_MONTH_FOCUS = {
  june: {
    title: "June — Design office app & connect Supabase",
    deadline: "June 30, 2026",
    summary:
      "Design every office screen, create the database structure in Supabase, and wire all modules to it using seed and demo data only — not live customer or move data yet.",
    bullets: [
      "Moves, calendar, CRM, inbox, dispatch, and admin — built and connected to Supabase",
      "Schema, staff login, and row-level security in place on seed data",
      "No live business data yet — production cutover in July",
      "Crew phone app waits until August",
    ],
  },
  july: {
    title: "July — Office app finished",
    deadline: "July 31, 2026",
    summary:
      "Everyone in the office can run the business in MoveHQ on a computer: real customers, real moves, real texts, real payments.",
    bullets: [
      "June platform on seed data → July switches to live data",
      "Customer & partner records (CRM), moves, calendar, dispatch",
      "Text customers and sync Outlook email from the Inbox",
      "Take deposits and payments with Stripe",
      "Proposals, contracts, e-sign, and customer portal",
      "Dashboard reports, sales & ops scorecards, CRM automations, and follow-up sequences",
      "Admin: staff, branding, pricing, templates",
    ],
  },
  august: {
    title: "August — Crew phones + launch prep",
    deadline: "August 2026",
    summary:
      "Crew app on phones, import old moves from a spreadsheet, test everything together, then go live September 1.",
    bullets: [
      "Crew app: today's jobs, forms, signatures, clock in/out",
      "Upload historical moves so reports are complete",
      "Fix anything still rough on the office side",
      "Practice runs: text a customer, run a move, pay, dispatch crew",
      "Train the team — switch to MoveHQ on September 1",
    ],
  },
} as const;


export const GANTT_STREAMS = {
  ui: { label: "Office app & Supabase (June)", color: "bg-brand-500" },
  data: { label: "Data & office features", color: "bg-violet-500" },
  integrations: { label: "Text, email, payments", color: "bg-amber-500" },
  mobile: { label: "Crew app", color: "bg-emerald-500" },
  launch: { label: "Go live", color: "bg-slate-700" },
  blocked: { label: "Unavailable", color: "bg-slate-300" },
} as const;

export const GANTT_BARS: GanttBar[] = [
  {
    id: "g-june-office",
    label: "June: design office app + Supabase (seed data)",
    start: "2026-06-01",
    end: "2026-06-30",
    stream: "ui",
    timelineRowId: "t1",
    note: "Build: UI + schema + wire modules — seed/demo rows only",
  },
  {
    id: "g-adam-off",
    label: "Adam off (wedding week)",
    start: "2026-07-02",
    end: "2026-07-08",
    stream: "blocked",
    timelineRowId: "t3",
  },
  {
    id: "g-desktop-july",
    label: "July: office app on real data (CRM, calendar, ops)",
    start: "2026-07-09",
    end: "2026-07-31",
    stream: "data",
    timelineRowId: "t4",
    note: "Build: live data + Twilio, Stripe, Outlook, documents",
  },
  {
    id: "g-twilio-stripe",
    label: "July: texting (Twilio) + payments (Stripe)",
    start: "2026-07-09",
    end: "2026-07-31",
    stream: "integrations",
    timelineRowId: "t4",
  },
  {
    id: "g-outlook-docs",
    label: "July: Outlook, documents, reports, automations",
    start: "2026-07-09",
    end: "2026-07-31",
    stream: "integrations",
    timelineRowId: "t4",
  },
  {
    id: "g-pwa",
    label: "August: crew app",
    start: "2026-08-01",
    end: "2026-08-22",
    stream: "mobile",
    timelineRowId: "t5",
    note: "Build: PWA move-day + clock",
  },
  {
    id: "g-csv-import",
    label: "August: import old moves from spreadsheet",
    start: "2026-08-01",
    end: "2026-08-15",
    stream: "data",
    timelineRowId: "t6",
  },
  {
    id: "g-finalize",
    label: "August: polish & team testing",
    start: "2026-08-10",
    end: "2026-08-28",
    stream: "launch",
    timelineRowId: "t7",
  },
  {
    id: "g-test-launch",
    label: "August: training & go live",
    start: "2026-08-20",
    end: "2026-09-01",
    stream: "launch",
    timelineRowId: "t8",
    note: "Build: Vercel production + monitoring · go-live Sep 1",
  },
];

export const GANTT_MILESTONES: GanttMilestone[] = [
  {
    id: "m-june-platform",
    label: "Office app wired to Supabase (seed data)",
    date: "2026-06-30",
    variant: "milestone",
  },
  { id: "m-adam-off", label: "Adam off (wedding)", date: "2026-07-02", variant: "blocked" },
  { id: "m-adam-back", label: "Adam back", date: "2026-07-09", variant: "milestone" },
  {
    id: "m-desktop-done",
    label: "Office app done (texts, payments, CRM)",
    date: "2026-07-31",
    variant: "milestone",
  },
  { id: "m-crew-app", label: "Crew app ready", date: "2026-08-22", variant: "milestone" },
  { id: "m-csv-import", label: "Past moves imported", date: "2026-08-15", variant: "milestone" },
  { id: "m-v1", label: "Go live", date: "2026-09-01", variant: "deadline" },
];

function groupItemIds(...groupIds: string[]): string[] {
  return V1_GROUPS.filter((g) => groupIds.includes(g.id)).flatMap((g) =>
    g.items.map((i) => i.id),
  );
}

/** Checklist items targeted for June (UI + Supabase seed wiring). */
export const V1_JUNE_ITEM_IDS: string[] = groupItemIds("ui-desktop", "june-supabase");

/** Checklist items targeted for July (desktop on live data). */
export const V1_JULY_ITEM_IDS: string[] = [
  ...groupItemIds(
    "intake",
    "calendar",
    "dashboard",
    "crm",
    "comms",
    "automations",
    "documents",
    "payments",
    "followups",
    "admin",
    "auth",
    "operations",
  ).filter(
    (id) =>
      ![
        "v1-admin-import",
        "v1-infra-vercel",
        "v1-infra-monitoring",
        "v1-ai-quote-hint",
        "v1-ai-note-summary",
      ].includes(id),
  ),
];

/** Checklist items targeted for August (crew + launch). */
export const V1_AUGUST_ITEM_IDS: string[] = [
  ...groupItemIds("ui-pwa", "timetrack", "data-import", "ai", "infra"),
  "v1-admin-import",
];

export const TIMELINE_TABLE: TimelineRow[] = [
  {
    id: "t1",
    phase: "June - Design office app & Supabase (seed data)",
    start: "2026-06-01",
    end: "2026-06-30",
    dates: "Jun 1 - Jun 30",
    deliverables:
      "Office screens designed; Supabase schema, seed data, and all modules wired — no live business data yet",
    itemIds: V1_JUNE_ITEM_IDS,
    ganttBarIds: ["g-june-office"],
  },
  {
    id: "t3",
    phase: "Adam off (wedding week)",
    start: "2026-07-02",
    end: "2026-07-08",
    dates: "Jul 2 - Jul 8",
    deliverables: "No major build deadlines this week",
    itemIds: [],
    rowKind: "note",
  },
  {
    id: "t4",
    phase: "July - Office app finished",
    start: "2026-07-09",
    end: "2026-07-31",
    dates: "Jul 9 - Jul 31",
    deliverables:
      "Run the business on the computer: CRM, calendar, dispatch, texts, Outlook email, Stripe payments, documents, reports",
    itemIds: V1_JULY_ITEM_IDS,
    ganttBarIds: ["g-desktop-july", "g-twilio-stripe", "g-outlook-docs"],
  },
  {
    id: "t5",
    phase: "August - Crew phone app",
    start: "2026-08-01",
    end: "2026-08-22",
    dates: "Aug 1 - Aug 22",
    deliverables: "Crew use phones for today's jobs, forms, signatures, and clock in/out",
    itemIds: groupItemIds("ui-pwa", "timetrack"),
    ganttBarIds: ["g-pwa"],
  },
  {
    id: "t6",
    phase: "August - Import old moves",
    start: "2026-08-01",
    end: "2026-08-15",
    dates: "Aug 1 - Aug 15",
    deliverables: "Upload spreadsheet of historical moves; fix errors; load into live system",
    itemIds: groupItemIds("data-import"),
    ganttBarIds: ["g-csv-import"],
  },
  {
    id: "t7",
    phase: "August - Test with the team",
    start: "2026-08-10",
    end: "2026-08-28",
    dates: "Aug 10 - Aug 28",
    deliverables: "Practice real workflows: book a move, text a customer, dispatch, take payment",
    itemIds: ["v1-ai-quote-hint", "v1-ai-note-summary"],
    ganttBarIds: ["g-finalize"],
  },
  {
    id: "t8",
    phase: "August - Go live",
    start: "2026-08-20",
    end: "2026-09-01",
    dates: "Aug 20 - Sep 1",
    deliverables: "Train staff, turn on live website September 1, monitor for issues",
    itemIds: ["v1-infra-vercel", "v1-infra-monitoring", "v1-infra-golive-data", "v1-csv-dry-run"],
    ganttBarIds: ["g-test-launch"],
  },
];

export function allV1ItemIds(): string[] {
  return V1_GROUPS.flatMap((g) => g.items.map((i) => i.id));
}

export function allV2ItemIds(): string[] {
  return V2_GROUPS.flatMap((g) => g.items.map((i) => i.id));
}
