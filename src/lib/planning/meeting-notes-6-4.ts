import type { PlanningGroup } from "./types";

export const MEETING_6_4_DATE_LABEL = "6/4";

/**
 * Checklist groups from 6/4 meeting — reorganized for clarity.
 * Jorge’s crew-app items are grouped under Crew app (field).
 */
export const MEETING_6_4_GROUPS: PlanningGroup[] = [
  {
    id: "meeting-604-sales",
    title: "Sales & leads",
    audienceDescription: "Prioritization, walkthroughs, and move-detail workflows for sales.",
    items: [
      {
        id: "meeting-604-lead-score-filter",
        label: "Filter moves/leads by lead score (Q1, Q2, Q3, Q4)",
        note: "Let sales and ops slice pipelines and lists by quarterly lead-score buckets.",
      },
      {
        id: "meeting-604-walkthroughs-ui",
        label: "Walkthroughs: improve UI/UX",
        note: "Better layout and workflow for scheduling and completing on-site walkthroughs.",
      },
      {
        id: "meeting-604-shipper-from-sidebar",
        label: "Add new shipper from move detail sidebar",
        note: "Same pattern as the new-move form — add shipper without leaving the move record.",
      },
    ],
  },
  {
    id: "meeting-604-calendar",
    title: "Calendar & revenue",
    audienceDescription: "Company-wide and personal calendars; booking metrics and revenue outlook.",
    items: [
      {
        id: "meeting-604-calendar-main-tab",
        label: "Staff calendar sidebar tab (Outlook) — mine vs company, Ops vs Sales",
        note:
          "Separate from Move Calendar. New sidebar tab for office staff schedules synced from Outlook — filter to your calendar, everyone, sales only, or ops only.",
      },
      {
        id: "meeting-604-revenue-projection",
        label: "Revenue projection on Move Calendar",
        note: "Show projected revenue near booking-rate % on day cards and in the calendar sidebar header (alongside booking %).",
      },
    ],
  },
  {
    id: "meeting-604-operations",
    title: "Operations, jobs & dispatch",
    audienceDescription: "Day-of dispatch, ops prep, field forms, and crew slot rules.",
    items: [
      {
        id: "meeting-604-ops-prep-done-list",
        label: "Jobs: Ops prep checklist — upcoming vs done",
        note: "Upcoming ops prep items can be checked off and move to a done/history list for audit.",
      },
      {
        id: "meeting-604-dispatch-skipper-driver",
        label: "Dispatch: combined Skipper/Driver slot",
        note: "If one person fills both roles: drop the D (driver) slot, use M (mover) + S/D on the S slot. Tap S/D to toggle back to separate S + D.",
      },
      {
        id: "meeting-604-dispatch-today-tomorrow",
        label: "Dispatch: default to Tomorrow; Today = reassignments",
        note: "Today view is for same-day reassignments (crew already assigned earlier). Main screen should open on tomorrow by default; Today UI may need rework.",
      },
      {
        id: "meeting-604-time-off-crew-notify",
        label: "Notify crew when time-off request is approved/denied",
        note: "Operations approves in admin; crew gets inbox/push when decision is made.",
      },
      {
        id: "meeting-604-take-home-signoff",
        label: "Jobs: client sign-off for items taken home",
        note: "Crew button when taking items home (customer giveaway or donation). Client signs; crew describes items. Surface on Operations → Jobs → past field packet/forms.",
      },
    ],
  },
  {
    id: "meeting-604-crew-app",
    title: "Crew app (field)",
    audienceDescription: "Mobile/PWA experience for skippers, drivers, and movers — Jorge feedback included.",
    items: [
      {
        id: "meeting-604-crew-media",
        label: "Add media to Crew App",
        note: "Photos/videos from the field attached to jobs (damage, inventory, sign-off, etc.).",
      },
      {
        id: "meeting-604-media-reanalyze",
        label: "Media: Not analyzed vs AI analyzed queues",
        note: "When customer texts new images (SMS), land in “not yet analyzed.” After AI run, move to analyzed — ties to requote / scope changes.",
      },
      {
        id: "meeting-604-crew-resources-tab",
        label: "Resources tab (benefits, payroll, links)",
        note: "Bottom nav tab. Admin configures links (health insurance, payroll apps, etc.) so crew can self-serve.",
      },
      {
        id: "meeting-604-crew-history-time-tips",
        label: "History, time, and tips (Jorge)",
        note: "Crew-visible history of jobs/time worked; tips reporting or display as discussed.",
      },
      {
        id: "meeting-604-crew-message-ops",
        label: "Leave a message for Operations (Jorge)",
        note: "Crew can flag/report off or send a written message to ops from the app.",
      },
      {
        id: "meeting-604-crew-depot-time",
        label: "Depot time / depot work selection (Jorge)",
        note: "Clock or log depot-side work separately from on-job time.",
      },
    ],
  },
  {
    id: "meeting-604-pricing-quotes",
    title: "Pricing, quotes & contracts",
    audienceDescription: "Flat-rate scope, inventory basis, rate history, and booking legal copy.",
    items: [
      {
        id: "meeting-604-flat-rate-all-in",
        label: "Flat rate is all-in (liability, wardrobe, CC fee, etc.) with cost breakdown",
        note: "Customer-facing flat rate covers everything listed, but internally we still cost out line items. Update proposals/contracts accordingly.",
      },
      {
        id: "meeting-604-cf-weight-pricing",
        label: "Cubic feet vs weight pricing on moves",
        note: "Move detail header + inventory + AI flat-rate quote should respect company default (cf vs weight) and show the right basis in UI.",
      },
      {
        id: "meeting-604-admin-defaults-nte-cf",
        label: "Admin → Defaults: Not-to-exceed (hourly) + default cf/weight for flat rate",
        note: "Company-level NTE for hourly jobs; default whether flat quotes use cubic feet or weight.",
      },
      {
        id: "meeting-604-supplies-rate-history",
        label: "Supplies & hourly rates: rate history",
        note: "When rates change, existing contracted moves keep old supply/hourly rates; new quotes use new rates. Need history view and apply correct rate per move/date.",
      },
      {
        id: "meeting-604-booking-card-agreement",
        label: "Booking: agree to charge card later (contract checkbox)",
        note: "To book, customer must acknowledge card will be charged later — contract/checkbox wording distinct from other terms.",
      },
    ],
  },
  {
    id: "meeting-604-integrations",
    title: "Integrations & AI",
    audienceDescription: "V1 consolidation and V2 expansion (email, chatbot).",
    items: [
      {
        id: "meeting-604-integrations-v1-ai",
        label: "Integrations V1: OpenAI/Claude under AI Integration",
        note: "Move provider config into a single AI Integration area; V2 expands capability on top.",
      },
      {
        id: "meeting-604-integrations-v2-gmail",
        label: "Integrations V2: Gmail",
      },
      {
        id: "meeting-604-integrations-v2-chatbot",
        label: "Integrations V2: Chatbot",
        note: "Website/customer chat — build on V1 AI integration foundation.",
      },
      {
        id: "meeting-604-video-liveswitch-note",
        label: "Video: own model & infrastructure (LiveSwitch as backup)",
        note: "Should not drive large product changes yet — parallel infra effort; LiveSwitch remains fallback.",
      },
    ],
  },
  {
    id: "meeting-604-platform",
    title: "Platform, office & reporting",
    audienceDescription: "Back-office time tracking and AI-assisted ops/crew reports.",
    items: [
      {
        id: "meeting-604-office-clock-in",
        label: "Hourly office team: clock in through MoveHQ",
        note: "Non-crew hourly staff time entry in the main app (not only crew app).",
      },
      {
        id: "meeting-604-ai-reports",
        label: "AI reports for crew, skippers, and operations",
        note: "Summaries/insights across performance, labor, issues — audience-specific report views.",
      },
    ],
  },
];

export const MEETING_6_4_DEFAULT_DONE_IDS = [
  "meeting-604-lead-score-filter",
  "meeting-604-walkthroughs-ui",
  "meeting-604-shipper-from-sidebar",
  "meeting-604-calendar-main-tab",
  "meeting-604-revenue-projection",
  "meeting-604-ops-prep-done-list",
  "meeting-604-dispatch-skipper-driver",
  "meeting-604-dispatch-today-tomorrow",
  "meeting-604-time-off-crew-notify",
  "meeting-604-take-home-signoff",
  "meeting-604-crew-media",
  "meeting-604-media-reanalyze",
  "meeting-604-crew-resources-tab",
  "meeting-604-crew-history-time-tips",
  "meeting-604-crew-message-ops",
  "meeting-604-crew-depot-time",
  "meeting-604-office-clock-in",
  "meeting-604-flat-rate-all-in",
  "meeting-604-cf-weight-pricing",
  "meeting-604-admin-defaults-nte-cf",
  "meeting-604-supplies-rate-history",
  "meeting-604-booking-card-agreement",
  "meeting-604-integrations-v1-ai",
  "meeting-604-integrations-v2-gmail",
  "meeting-604-integrations-v2-chatbot",
  "meeting-604-video-liveswitch-note",
] as const;
