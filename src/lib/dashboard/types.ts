export const DASHBOARD_VIEWS = ["ceo", "manager", "sales", "ops"] as const;
export type DashboardView = (typeof DASHBOARD_VIEWS)[number];
