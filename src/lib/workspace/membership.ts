import { DEFAULT_COMPANY_ID, DEFAULT_PRIMARY_LOCATION_ID } from "./constants";
import type { UserWorkspaceMembership } from "./types";

/** Demo membership — replace with auth session + RLS when Supabase is wired. */
export const DEMO_WORKSPACE_MEMBERSHIP: UserWorkspaceMembership = {
  companyId: DEFAULT_COMPANY_ID,
  role: "owner",
  primaryLocationId: DEFAULT_PRIMARY_LOCATION_ID,
  locationAccess: "all",
};
