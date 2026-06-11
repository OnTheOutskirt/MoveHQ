import type { PlanningGroup } from "./types";

export const UI_TODO_TAB_LABEL = "Last UI to-do";

/** Remaining MoveHQ office / crew UI polish — not tied to a single meeting date. */
export const UI_TODO_GROUPS: PlanningGroup[] = [
  {
    id: "ui-todo-movehq",
    title: "JM Move HQ user interface to-do",
    audienceDescription:
      "Final UI passes across the office app, setup, crew app, and shared chrome before go-live.",
    items: [
      {
        id: "ui-todo-dashboard",
        label: "Dashboard (Executive, Manager, Sales, Ops)",
      },
      {
        id: "ui-todo-inbox",
        label: "Finalize Inbox (Needs Reply?)",
      },
      {
        id: "ui-todo-pipeline",
        label: "Move Pipeline",
        note: "Remove Web Booking Needs Review filter; ensure list view is solid.",
      },
      {
        id: "ui-todo-new-move-form",
        label: "New Move Form",
        note: "Full width; rethink layout and flow.",
      },
      {
        id: "ui-todo-move-detail",
        label: "Move Detail View",
        note:
          "Finalize quick actions; finalize/check/remove/move customer portal; check and change all tabs, sub-tabs, and sub-tab UI switching.",
      },
      {
        id: "ui-todo-ai-web-quotes",
        label: "AI Web Quotes",
        note: "Ensure UI is good end-to-end.",
      },
      {
        id: "ui-todo-follow-ups",
        label: "Follow-ups",
        note: "Finalize follow-ups UI screen.",
      },
      {
        id: "ui-todo-documents",
        label: "Documents",
        note: "Portal link? Needs attention queue.",
      },
      {
        id: "ui-todo-directory",
        label: "Directory",
        note: "Referral partners, organizations, referral contacts/types (admin).",
      },
      {
        id: "ui-todo-jobs",
        label: "Jobs",
        note: "Double-check and probably rework some areas. How does Ops Prep get there?",
      },
      {
        id: "ui-todo-dispatch",
        label: "Dispatch",
        note:
          "When dragging an FTA, shrink jobs view to see more? Drag scheduled FTA to another slot; maybe more.",
      },
      {
        id: "ui-todo-claims",
        label: "Claims",
        note: "Still needs work; delete pipeline view.",
      },
      {
        id: "ui-todo-crew",
        label: "Crew",
        note:
          "HR document select manager; remove camera thing from desktop app; meeting report rework; rework reports; time off status; check skippers & drivers.",
      },
      {
        id: "ui-todo-fleet",
        label: "Fleet",
        note: "Maintenance button/form; out of service → button + sidebar form.",
      },
      {
        id: "ui-todo-inventory",
        label: "Inventory",
        note: "Rework entirely.",
      },
      {
        id: "ui-todo-payroll-time",
        label: "Payroll & Time",
        note:
          "Should everyone see time? Hourly on profile for office staff? Rework payroll, approval, and related flows.",
      },
      {
        id: "ui-todo-reports",
        label: "Reports",
        note: "Decide which reports matter and add them.",
      },
      {
        id: "ui-todo-staff",
        label: "Staff",
        note: "Proper permissions/roles; don't live; is pay needed?; other tabs?",
      },
      {
        id: "ui-todo-company",
        label: "Company",
        note: "Figure out locations, notifications, and related settings.",
      },
      {
        id: "ui-todo-setup",
        label: "Setup",
        note:
          "Go through all — rates, rework tabs, automations & follow-up rework entirely, more terminology, move types, leads. Check everything.",
      },
      {
        id: "ui-todo-multi-location",
        label: "Multi-location",
      },
      {
        id: "ui-todo-notifications",
        label: "Notifications",
      },
      {
        id: "ui-todo-profile",
        label: "Profile",
        note: "Anything to add?",
      },
      {
        id: "ui-todo-office-walkthrough",
        label: "Office / Walkthrough / Operations app",
        note: "Same app — visibility depends on who is logged in.",
      },
      {
        id: "ui-todo-crew-app",
        label: "Finish Crew App",
      },
      {
        id: "ui-todo-sidebar",
        label: "Sidebar",
        note:
          "Remove extra line when single location (line only when multi-location); more spacing.",
      },
      {
        id: "ui-todo-view-as-role",
        label: "View as role",
        note: "Show all proper things; view mobile/desktop for all role types.",
      },
    ],
  },
];

export const UI_TODO_DEFAULT_DONE_IDS = [] as const;
