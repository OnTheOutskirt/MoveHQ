export const DASHBOARD_VIEWS = ["executive", "sales", "ops"] as const;
export type DashboardView = (typeof DASHBOARD_VIEWS)[number];
