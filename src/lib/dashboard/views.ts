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
    audience: "Owner / admin — company health at a glance.",
    plannedWidgets: [
      "Revenue & margin (MTD / YTD)",
      "Booked vs capacity trend",
      "Cash & AR snapshot",
      "Win rate & pipeline value",
      "Crew utilization & labor %",
      "Alerts needing owner attention",
    ],
    notes: "High-level only; drill-down links into Moves, Calendar, and reports.",
  },
  manager: {
    id: "manager",
    label: "Manager",
    headline: "Operations & team pulse",
    audience: "Office managers — day-to-day coordination across sales and ops.",
    plannedWidgets: [
      "Today & tomorrow capacity (movers / trucks)",
      "Jobs at risk or understaffed",
      "Open quotes & follow-ups due",
      "Dispatch gaps",
      "Team schedule conflicts",
      "Customer issues / callbacks",
    ],
  },
  sales: {
    id: "sales",
    label: "Sales",
    headline: "Pipeline & bookings",
    audience: "Sales reps — personal book or whole team when permitted.",
    plannedWidgets: [
      "My (or team) open quotes & close dates",
      "Booked moves this week / month",
      "Conversion & average ticket",
      "Follow-ups & tasks due today",
      "Lost reasons (recent)",
      "Leaderboard (optional, manager view)",
    ],
    notes:
      "Person filter (me / teammate / all) belongs on this view as a control, not a separate dashboard tab.",
  },
  ops: {
    id: "ops",
    label: "Ops",
    headline: "Field & fleet readiness",
    audience: "Operations / dispatch — crews, trucks, and job days.",
    plannedWidgets: [
      "Today’s Job Days board summary",
      "Crew & truck assignments",
      "Unassigned / partial jobs",
      "Truck & equipment status",
      "Forms incomplete from the field",
      "Tomorrow capacity vs booked",
    ],
  },
};

export const dashboardTabs = (Object.values(dashboardViews) as DashboardViewMeta[]).map(
  (v) => ({ id: v.id, label: v.label }),
);
