import type { DashboardView } from "./types";

export type DashboardViewMeta = {
  id: DashboardView;
  label: string;
  headline: string;
  audience: string;
  /** Widgets we plan to build on this dashboard */
  plannedWidgets: string[];
  /** UX notes while designing */
  notes?: string;
};

export const dashboardViews: Record<DashboardView, DashboardViewMeta> = {
  executive: {
    id: "executive",
    label: "Executive",
    headline: "Executive overview",
    audience: "Owner / admin — company health and CEO monthly scorecard.",
    plannedWidgets: [
      "Revenue & gross margin MTD vs target",
      "Mover & truck utilization",
      "Open claims & pipeline value",
      "Operations pulse & alerts",
      "CEO Snapshot scorecard (weekly buckets)",
    ],
  },
  sales: {
    id: "sales",
    label: "Sales",
    headline: "Pipeline & bookings",
    audience: "Sales reps — my sales or team-wide; managers can drill into any rep.",
    plannedWidgets: [
      "Follow-ups (overdue / today / upcoming)",
      "Open pipeline by stage & quote value",
      "AI web quote queues",
      "Walkthroughs needing action",
      "Booked this week / month",
      "Recent lost & team leaderboard",
    ],
  },
  ops: {
    id: "ops",
    label: "Ops",
    headline: "Field & fleet readiness",
    audience: "Operations / dispatch — crews, trucks, job days, prep, and claims.",
    plannedWidgets: [
      "Today’s job days & staffing gaps",
      "Ops prep due today",
      "Tomorrow dispatch & fleet capacity",
      "Claims workflow status",
      "Inventory & crew time-off alerts",
      "Quick links to Jobs, Dispatch, Fleet",
    ],
  },
};

export const dashboardTabs = (Object.values(dashboardViews) as DashboardViewMeta[]).map(
  (v) => ({ id: v.id, label: v.label }),
);
