import type { PlanningGroup } from "./types";

export const V1_GROUPS: PlanningGroup[] = [
  {
    id: "ui-desktop",
    title: "Office app — screens & layout (June)",
    audienceDescription:
      "Design every page the office will use — layout, navigation, and workflows — so the team can click through and approve before go-live data.",
    builderDescription: "Next.js UI; all routes and modules; pairs with Supabase wiring same month.",
    items: [
      {
        id: "v1-ui-shell",
        label: "Main navigation, menus, and layouts for different roles",
        builderNote: "App shell, sidebar, role-aware layouts",
      },
      {
        id: "v1-ui-dashboard",
        label: "Dashboard home screens (owner, sales, operations views)",
        builderNote: "Exec / sales / ops dashboard variants",
      },
      {
        id: "v1-ui-calendar",
        label: "Move calendar — see booked days, capacity, and drill into a day",
        builderNote: "Month/week views, capacity, job-day drill-down",
      },
      {
        id: "v1-ui-moves",
        label: "Moves list, pipeline board, and full move detail page",
        builderNote: "Pipeline, detail tabs, quick actions, move scope",
      },
      {
        id: "v1-ui-people",
        label: "People directory — customers, leads, partners, companies",
        builderNote: "CRM directory UI",
      },
      {
        id: "v1-ui-inbox",
        label: "Inbox — see emails, texts, and calls in one place per move",
        note: "Smart auto-replies come in V2; V1 is real messages with your team replying.",
        builderNote: "Email + SMS + call thread UI",
      },
      {
        id: "v1-ui-followups",
        label: "Follow-ups queue — who to call back and when",
        builderNote: "Follow-ups module UI",
      },
      {
        id: "v1-ui-documents",
        label: "Documents area — proposals, contracts, and files on a move",
        builderNote: "Documents library UI",
      },
      {
        id: "v1-ui-ops",
        label: "Operations screens — jobs, dispatch, crew, trucks, forms, reports",
        builderNote: "All /operations/* modules",
      },
      {
        id: "v1-ui-admin",
        label: "Admin settings — staff, branding, pricing, templates, integrations",
        builderNote: "Full admin section",
      },
      {
        id: "v1-ui-planning",
        label: "This planning & roadmap page",
        builderNote: "Planning module",
      },
    ],
  },
  {
    id: "june-supabase",
    title: "Supabase & wiring the office app (June)",
    audienceDescription:
      "Create the database structure in Supabase and connect every office screen to it. Use seed and demo rows only — not live customer or move data yet.",
    builderDescription: "Supabase schema + Auth + RLS; wire modules to Postgres; seed data only.",
    items: [
      {
        id: "v1-infra-schema",
        label: "Database structure in Supabase (moves, people, messages, payments)",
        builderNote: "Postgres schema + RLS policies",
      },
      {
        id: "v1-infra-seed",
        label: "Seed / demo data in Supabase for development",
        note: "Sample rows to test wiring — not production or live business data.",
        builderNote: "Seed scripts + dev dataset",
      },
      {
        id: "v1-infra-wire",
        label: "Connect office app modules to Supabase",
        builderNote: "Moves, CRM, calendar, dispatch, inbox UI, admin — read/write seed data",
      },
      {
        id: "v1-auth-supabase",
        label: "Staff log in securely and link to their staff record",
        builderNote: "Supabase Auth + staff link",
      },
      {
        id: "v1-auth-roles",
        label: "Row-level security and role-based access in place",
        builderNote: "RLS + route guards on seed data",
      },
      {
        id: "v1-cal-seed",
        label: "Calendar and dispatch use job days from Supabase seed data",
        note: "Proves scheduling UI against the database before live bookings in July.",
        builderNote: "Calendar ↔ Supabase (seed)",
      },
    ],
  },
  {
    id: "ui-pwa",
    title: "Crew phone app (August)",
    audienceDescription:
      "What movers use on move day — today's jobs, forms, signatures, and clock in/out.",
    builderDescription: "PWA shell; ship in August.",
    items: [
      {
        id: "v1-pwa-shell",
        label: "App installs on crew phones and crew can log in",
        builderNote: "PWA manifest, auth, basic offline",
      },
      {
        id: "v1-pwa-today",
        label: "Today's jobs list for each crew member",
        builderNote: "Job day list view",
      },
      {
        id: "v1-pwa-job-detail",
        label: "Job details — addresses, notes, customer contact",
        builderNote: "Job detail screen",
      },
      {
        id: "v1-pwa-forms",
        label: "Digital forms and customer signatures on site",
        builderNote: "Field forms + signature capture",
      },
      {
        id: "v1-pwa-clock",
        label: "Clock in and clock out from the phone",
        builderNote: "Time clock UI",
      },
    ],
  },
  {
    id: "data-import",
    title: "Bring in old moves from a spreadsheet (August)",
    audienceDescription:
      "Upload years of past moves so reports and customer history are complete on day one.",
    builderDescription: "CSV import pipeline + admin UI.",
    items: [
      {
        id: "v1-csv-template",
        label: "Spreadsheet template that shows which columns we need",
        builderNote: "CSV template + field mapping doc",
      },
      {
        id: "v1-csv-upload-ui",
        label: "Upload screen in Admin — drag file, preview before import",
        builderNote: "Admin upload UI with preview",
      },
      {
        id: "v1-csv-validate",
        label: "System checks for missing dates, bad data, duplicates",
        builderNote: "Row validation rules",
      },
      {
        id: "v1-csv-import-moves",
        label: "Create moves with customer, addresses, dates, status, money fields",
        builderNote: "Move record import",
      },
      {
        id: "v1-csv-import-people",
        label: "Create or link customer and partner records from the file",
        builderNote: "People import + linking",
      },
      {
        id: "v1-csv-import-jobdays",
        label: "Optional: crew and truck assignments per day from file",
        builderNote: "Job day columns",
      },
      {
        id: "v1-csv-error-report",
        label: "Download a list of rows that failed and why",
        builderNote: "Error report export",
      },
      {
        id: "v1-csv-dry-run",
        label: "Practice import that does not change live data until you confirm",
        builderNote: "Dry-run mode",
      },
    ],
  },
  {
    id: "intake",
    title: "How new jobs get into the system",
    audienceDescription: "Flat-rate from the website and hourly forms inside MoveHQ.",
    items: [
      {
        id: "v1-form-flat-external",
        label: "Website flat-rate form creates a move automatically",
        note: "Your existing customer-facing intake.",
        builderNote: "External form → API",
      },
      {
        id: "v1-form-flat-inapp",
        label: "Optional: enter flat-rate intake inside the office app",
        builderNote: "In-app flat-rate capture",
      },
      {
        id: "v1-form-hourly",
        label: "Hourly job questionnaire built in MoveHQ",
        builderNote: "Hourly intake form",
      },
    ],
  },
  {
    id: "calendar",
    title: "Calendar & scheduling (July)",
    audienceDescription:
      "Live calendar tied to real booked moves and job days — switching from June seed data to production use.",
    items: [
      {
        id: "v1-cal-backend",
        label: "Calendar shows real booked moves and job days (live data)",
        builderNote: "Supabase-backed calendar — live moves",
      },
      {
        id: "v1-cal-capacity",
        label: "Capacity lines, closed days, and warning when overbooked",
        builderNote: "Capacity + closed days",
      },
      {
        id: "v1-cal-dispatch-link",
        label: "Dispatch board stays in sync with the calendar",
        builderNote: "Calendar ↔ dispatch link",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & business reports (July)",
    audienceDescription:
      "See how the company is performing — money, leads, crew, trucks, and scorecards for sales and operations.",
    items: [
      { id: "v1-rpt-move-profit", label: "Profit and revenue for each move" },
      { id: "v1-rpt-company", label: "Company-wide revenue and profit" },
      {
        id: "v1-rpt-sales",
        label: "How each salesperson is performing",
        note: "Feeds the sales scorecard.",
      },
      {
        id: "v1-rpt-ops",
        label: "Truck and crew utilization",
        note: "Feeds the operations scorecard.",
      },
      {
        id: "v1-rpt-leads",
        label: "Leads and how many turn into booked moves (conversion rate)",
      },
      {
        id: "v1-rpt-sales-scorecard",
        label: "Sales scorecard — pipeline, follow-ups, conversion, and rep performance",
        note: "Part of reporting.",
        builderNote: "Sales scorecard views",
      },
      {
        id: "v1-rpt-ops-scorecard",
        label: "Operations scorecard — utilization, job-day health, labor vs plan",
        note: "Part of reporting.",
        builderNote: "Ops scorecard views",
      },
    ],
  },
  {
    id: "crm",
    title: "Customer & partner records (July)",
    audienceDescription:
      "One place for everyone you work with — leads, customers, referrers, companies. CRM focus: strong automations so nothing falls through the cracks.",
    items: [
      { id: "v1-crm-leads", label: "Track leads before they book" },
      { id: "v1-crm-customers", label: "Customers / shippers on moves" },
      { id: "v1-crm-referral", label: "Referral partners (realtors, etc.)" },
      { id: "v1-crm-companies", label: "Companies and organizations" },
      {
        id: "v1-crm-link-moves",
        label: "Link people to moves, messages, and documents",
        builderNote: "CRM ↔ move/inbox/docs links",
      },
    ],
  },
  {
    id: "comms",
    title: "Texts, calls & email (July)",
    audienceDescription:
      "Real two-way texting and Outlook email in the inbox. Your team sends and receives messages; AI auto-reply is V2.",
    builderDescription: "Twilio + Microsoft Graph + Resend.",
    items: [
      {
        id: "v1-twilio-account",
        label: "Company text numbers set up and working",
        builderNote: "Twilio account + numbers + webhooks",
      },
      {
        id: "v1-twilio-sms-inbound",
        label: "Incoming texts appear in Inbox and link to the right move",
        builderNote: "Inbound SMS → inbox threading",
      },
      {
        id: "v1-twilio-sms-outbound",
        label: "Send texts from Inbox and from a move page",
        builderNote: "Outbound SMS API",
      },
      {
        id: "v1-twilio-sms-sequences",
        label: "Automated follow-up texts as part of a sequence",
        note: "Includes opt-out compliance.",
        builderNote: "SMS sequence steps",
      },
      {
        id: "v1-twilio-voice-log",
        label: "Log calls — who called, how long, tied to a move",
        builderNote: "Call logging",
      },
      {
        id: "v1-twilio-click-call",
        label: "Click a number on a move to start a call",
        builderNote: "Click-to-call",
      },
      {
        id: "v1-outlook",
        label: "Outlook email syncs both ways with the Inbox",
        builderNote: "Microsoft Graph 2-way sync",
      },
      {
        id: "v1-resend",
        label: "System sends notification emails to customers and staff",
        builderNote: "Resend transactional email",
      },
    ],
  },
  {
    id: "automations",
    title: "Simple automations (July)",
    audienceDescription:
      "When something happens on a move, the system can create tasks or send templated messages. CRM-focused rules pair with the follow-ups queue.",
    items: [
      {
        id: "v1-auto-triggers",
        label: "Rules when move stage or status changes",
        builderNote: "Stage/status triggers",
      },
      {
        id: "v1-auto-tasks",
        label: "Auto-create internal tasks and alerts for the team",
        builderNote: "Task + notification creation",
      },
      {
        id: "v1-auto-templates",
        label: "Send template emails or texts on key events",
        builderNote: "Template messages",
      },
      {
        id: "v1-auto-crm-proposal",
        label: "Proposal follow-ups — task when a quote sits too long without reply",
        note: "CRM focus.",
        builderNote: "Stale proposal triggers",
      },
      {
        id: "v1-auto-crm-outreach",
        label: "Track who was reached out to and who still needs contact",
        note: "CRM focus.",
        builderNote: "Outreach tracking + tasks",
      },
      {
        id: "v1-auto-crm-walkthrough",
        label: "Alert at 3 days since walkthrough with no next step booked",
        note: "CRM focus.",
        builderNote: "Walkthrough stale rule",
      },
      {
        id: "v1-auto-crm-rotting",
        label: "Rotting jobs — flag stale pipeline moves and surface conversion rate",
        note: "CRM focus — ties to scorecards and follow-ups.",
        builderNote: "Rotting pipeline detection",
      },
    ],
  },
  {
    id: "documents",
    title: "Proposals, contracts & e-sign (July)",
    audienceDescription: "Generate documents from templates; customers can sign and pay online.",
    items: [
      { id: "v1-doc-templates", label: "Templates for proposals, contracts, confirmations" },
      { id: "v1-doc-generate", label: "Fill PDFs automatically from move information" },
      { id: "v1-doc-esign", label: "Customers sign electronically (more than bare minimum)" },
      {
        id: "v1-portal",
        label: "Customer portal — view proposal, sign, and pay online",
        builderNote: "Client portal + Stripe link",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments with Stripe (July)",
    audienceDescription: "Collect deposits and final payment; optionally charge saved card when move is done.",
    items: [
      { id: "v1-stripe-connect", label: "Stripe connected to Jonah's Movers account" },
      { id: "v1-stripe-deposit", label: "Collect booking deposits" },
      { id: "v1-stripe-balance", label: "Collect balance due and send receipts" },
      {
        id: "v1-stripe-auto",
        label: "Charge saved card when move is marked complete (with permission)",
        builderNote: "Saved payment method + auto-charge",
      },
    ],
  },
  {
    id: "followups",
    title: "Follow-up sequences (July)",
    audienceDescription:
      "Automated series of emails and texts to nurture leads until they book or reply. Works with CRM automations (proposal follow-ups, walkthrough reminders, rotting jobs).",
    items: [
      {
        id: "v1-seq-builder",
        label: "Build a sequence with email and text steps",
        builderNote: "Sequence builder UI",
      },
      {
        id: "v1-seq-enroll",
        label: "Enroll a lead or move; pause when they reply",
        builderNote: "Enrollment + pause on reply",
      },
      {
        id: "v1-seq-proposal",
        label: "Proposal follow-up steps in sequences",
        note: "CRM focus — pairs with automations.",
        builderNote: "Proposal sequence templates",
      },
    ],
  },
  {
    id: "admin",
    title: "Admin & company settings (July)",
    audienceDescription: "Control staff, branding, pricing, templates, and connected services.",
    items: [
      { id: "v1-admin-staff", label: "Staff list, roles, permissions, pay rates" },
      { id: "v1-admin-brand", label: "Logo, colors, company info on documents" },
      { id: "v1-admin-defaults", label: "Default settings for how moves work" },
      { id: "v1-admin-notify", label: "Who gets alerts in the app and by email" },
      { id: "v1-admin-templates", label: "Edit document and proposal templates" },
      { id: "v1-admin-pricing", label: "Pricing rules and rate setup" },
      { id: "v1-admin-fields", label: "Move statuses and custom fields" },
      {
        id: "v1-admin-integrations",
        label: "Connect Stripe, Outlook, and texting in one place",
        builderNote: "Integrations hub",
      },
      {
        id: "v1-admin-import",
        label: "Upload past moves (CSV) from Admin",
        builderNote: "Import UI entry point",
      },
    ],
  },
  {
    id: "auth",
    title: "Logins & permissions (July)",
    audienceDescription:
      "Finish account management for the live system — invites and password resets for real staff.",
    items: [
      {
        id: "v1-auth-invite",
        label: "Invite new users and reset passwords",
        builderNote: "Invite / reset flows",
      },
    ],
  },
  {
    id: "ai",
    title: "Light AI help (August, if time)",
    audienceDescription:
      "Small assists only — not auto-reply on phone or email (that's V2).",
    builderDescription: "OpenAI lightweight; not comms agents.",
    items: [
      {
        id: "v1-ai-quote-hint",
        label: "Suggestions while reviewing intake or move scope",
        builderNote: "Quote/scope assist",
      },
      {
        id: "v1-ai-note-summary",
        label: "Short summary of notes and activity on a busy move",
        builderNote: "Note summarization",
      },
    ],
  },
  {
    id: "operations",
    title: "Dispatch & daily operations (July)",
    audienceDescription: "Run tomorrow's jobs — assign crew and trucks, track time off, drive time.",
    items: [
      { id: "v1-ops-jobs", label: "See all job days by date" },
      {
        id: "v1-ops-dispatch",
        label: "Schedule crew and trucks for tomorrow and future days",
        builderNote: "Dispatch board",
      },
      { id: "v1-ops-crew-off", label: "Crew time-off shows on calendar and dispatch" },
      { id: "v1-ops-trucks", label: "Truck list and basic fleet info" },
      { id: "v1-ops-drive-time", label: "Enter drive time between stops" },
      {
        id: "v1-google-maps",
        label: "Google Maps Platform — routes, embeds, geocoding, Places autocomplete",
        builderNote: "Maps JavaScript, Directions, Geocoding, Places APIs",
      },
      {
        id: "v1-ops-forms",
        label: "Office can see forms submitted from crew phones",
        builderNote:
          "Past jobs → Field packet sidebar (demo); crew app fieldwork submission pipeline later",
      },
    ],
  },
  {
    id: "timetrack",
    title: "Crew hours for payroll (August)",
    audienceDescription: "Hours from the crew app roll up into reports for payroll.",
    items: [
      {
        id: "v1-time-clock",
        label: "Clock data from crew app saved per job day",
        builderNote: "Clock events in DB",
      },
      { id: "v1-time-reports", label: "Reports exportable for payroll" },
    ],
  },
  {
    id: "infra",
    title: "Hosting & go-live ops (August)",
    audienceDescription: "Staging and production hosting, plus monitoring before and after launch.",
    builderDescription: "Vercel + monitoring.",
    items: [
      {
        id: "v1-infra-vercel",
        label: "Staging site for testing, then live website address",
        builderNote: "Vercel staging + production",
      },
      {
        id: "v1-infra-monitoring",
        label: "Alerts if the app errors; backup checklist",
        builderNote: "Monitoring + backups",
      },
      {
        id: "v1-infra-golive-data",
        label: "Go-live data plan — seed vs import vs live operations",
        builderNote: "Runbook for production data cutover",
      },
    ],
  },
];

export const V2_GROUPS: PlanningGroup[] = [
  {
    id: "v2-comms-sms",
    title: "Smarter texting (V2)",
    audienceDescription: "AI helps draft or send text replies; your team can take over anytime.",
    items: [
      {
        id: "v2-sms-ai-draft",
        label: "AI suggests text replies — one click to send",
        builderNote: "Draft API + inbox UI",
      },
      {
        id: "v2-sms-ai-auto",
        label: "Optional auto-text when closed or for simple questions",
        builderNote: "Rules engine + auto-send",
      },
      {
        id: "v2-sms-ai-handoff",
        label: "When a human replies, automation pauses",
        builderNote: "Human takeover",
      },
      {
        id: "v2-sms-ai-context",
        label: "AI knows move stage, intake, and recent messages",
        builderNote: "Context injection",
      },
    ],
  },
  {
    id: "v2-comms-voice",
    title: "Smarter phone calls (V2)",
    audienceDescription: "After hours, an AI can answer calls and route urgent ones to your team.",
    items: [
      {
        id: "v2-voice-after-hours",
        label: "AI answers the phone when the office is closed",
        builderNote: "Twilio + Vapi/Retell/OpenAI voice",
      },
      {
        id: "v2-voice-overflow",
        label: "When all lines are busy, smart routing or voicemail",
        builderNote: "Overflow routing",
      },
      {
        id: "v2-voice-transcript",
        label: "Call turned into text on the move timeline",
        builderNote: "Transcription pipeline",
      },
      {
        id: "v2-voice-warm-transfer",
        label: "Transfer important calls to on-call sales or ops",
        builderNote: "Warm transfer",
      },
      {
        id: "v2-voice-voicemail",
        label: "Voicemail with AI summary in the inbox",
        builderNote: "Voicemail + summary",
      },
    ],
  },
  {
    id: "v2-comms-email",
    title: "Smarter email (V2)",
    audienceDescription: "AI suggests or sends email replies synced with Outlook.",
    items: [
      {
        id: "v2-email-ai-draft",
        label: "Suggested email replies in the Inbox",
        builderNote: "Outlook-synced drafts",
      },
      {
        id: "v2-email-ai-auto",
        label: "Optional auto-reply after hours or for FAQs",
        builderNote: "Auto-respond rules",
      },
      {
        id: "v2-email-ai-triage",
        label: "Flag urgent emails for sales first",
        builderNote: "Priority scoring",
      },
    ],
  },
  {
    id: "v2-comms-unified",
    title: "All messages in one timeline (V2)",
    items: [
      {
        id: "v2-inbox-unified",
        label: "One timeline per move: texts, calls, and email together",
        builderNote: "Unified activity feed",
      },
      {
        id: "v2-comms-analytics",
        label: "Reports: response time and conversion by channel",
        builderNote: "Comms analytics",
      },
    ],
  },
  {
    id: "v2-ai",
    title: "Deeper AI for sales & ops (V2)",
    items: [
      {
        id: "v2-ai-quote-full",
        label: "AI helps build quotes and scope recommendations",
        builderNote: "Full quote AI",
      },
      {
        id: "v2-ai-ops",
        label: "AI suggests dispatch and capacity adjustments",
        builderNote: "Ops suggestions",
      },
      {
        id: "v2-ai-followup-copy",
        label: "AI writes follow-up sequence messages",
        builderNote: "Sequence copy generation",
      },
    ],
  },
  {
    id: "v2-automations",
    title: "Powerful automations (V2)",
    audienceDescription: "Build your own if-this-then-that rules without calling a developer.",
    items: [
      {
        id: "v2-auto-builder",
        label: "Visual automation builder",
        builderNote: "Drag-drop builder",
      },
      {
        id: "v2-auto-branches",
        label: "Branches, delays, and connections to other tools",
        builderNote: "Branches + webhooks",
      },
      {
        id: "v2-auto-ai-steps",
        label: "Automation steps that trigger AI messages",
        builderNote: "AI step type",
      },
    ],
  },
  {
    id: "v2-followups",
    title: "Advanced follow-ups (V2)",
    items: [
      {
        id: "v2-seq-multi",
        label: "Richer sequences across email and text",
        builderNote: "Multi-channel sequences",
      },
      {
        id: "v2-seq-analytics",
        label: "See which sequences convert best",
        builderNote: "A/B + analytics",
      },
    ],
  },
  {
    id: "v2-marketing",
    title: "Marketing dashboard (V2)",
    audienceDescription: "See website traffic and run email campaigns.",
    items: [
      { id: "v2-ga", label: "Google Analytics — who visits the website" },
      { id: "v2-gsc", label: "Google Search Console — search performance" },
      { id: "v2-gtm", label: "Google Tag Manager — tracking tags" },
      {
        id: "v2-email-mkt",
        label: "Email marketing campaigns",
        builderNote: "Resend campaigns",
      },
    ],
  },
  {
    id: "v2-crew-app",
    title: "Full crew app experience (V2)",
    audienceDescription: "Beyond move day — schedule, docs, recognition, works offline better.",
    items: [
      {
        id: "v2-crew-self-serve",
        label: "Crew see schedule and documents without calling the office",
        builderNote: "Self-serve portal",
      },
      {
        id: "v2-crew-gamify",
        label: "Leaderboards and metrics for crew motivation",
        builderNote: "Gamification",
      },
      {
        id: "v2-crew-offline",
        label: "Works reliably with weak cell signal; photos sync later",
        builderNote: "Offline + photo sync",
      },
    ],
  },
  {
    id: "v2-docs",
    title: "Better proposals & contracts (V2)",
    items: [
      { id: "v2-proposals", label: "Advanced proposal builder with options" },
      { id: "v2-contracts", label: "Contract library with different clauses" },
    ],
  },
  {
    id: "v2-time",
    title: "Payroll-ready time tracking (V2)",
    items: [
      { id: "v2-time-approvals", label: "Managers approve or fix hours before payroll" },
      {
        id: "v2-time-export",
        label: "Export hours to payroll software",
        builderNote: "Payroll integrations",
      },
    ],
  },
  {
    id: "v2-reports",
    title: "Custom reporting (V2)",
    items: [
      { id: "v2-rpt-custom", label: "Build your own reports" },
      { id: "v2-rpt-scheduled", label: "Email reports automatically on a schedule" },
    ],
  },
  {
    id: "v2-walkthrough",
    title: "Sales walkthrough app (V2)",
    audienceDescription: "Estimator app for in-home visits — photos and notes on a tablet.",
    items: [
      {
        id: "v2-walkthrough-app",
        label: "Mobile app for sales walkthroughs",
        builderNote: "Walkthrough capture PWA/native",
      },
    ],
  },
  {
    id: "v2-website",
    title: "Website AI (V2)",
    audienceDescription:
      "AI on jonahsmovers.com to answer questions, qualify leads, and hand off to the office.",
    items: [
      {
        id: "v2-website-chatbot",
        label: "AI chatbot on the company website",
        builderNote: "Embedded widget + lead capture into MoveHQ",
      },
    ],
  },
  {
    id: "v2-integrations",
    title: "Integrations (V2)",
    audienceDescription: "Connect MoveHQ to other tools the business uses.",
    items: [
      {
        id: "v2-rippling",
        label: "Rippling payroll & HR integration",
        note: "Payroll, time tracking, and HR sync when ready post-launch.",
        builderNote: "Rippling API",
      },
    ],
  },
];
