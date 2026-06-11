import type { WeekdayId } from "@/lib/operations/fleet-types";
import type { WeekStartsOn } from "@/lib/settings/types";
import type { WorkspaceCalendarConfig } from "@/lib/calendar/metrics/types";

/** Workspace = one moving company (SaaS tenant). Not CRM `OrganizationRecord`. */
export type LocationStatus = "active" | "planned" | "inactive";

export type WorkspaceLocation = {
  id: string;
  companyId: string;
  name: string;
  shortName: string;
  status: LocationStatus;
  isPrimary: boolean;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  phone: string;
  email: string;
  website: string;
  /** Google Business Profile “leave a review” link for this branch. */
  googleReviewUrl: string;
  quoteReferencePrefix: string;
  serviceAreaNotes: string;
  /** Customer-facing / sales office hours (e.g. Mon–Fri 8–5). */
  officeHoursStart: string;
  officeHoursEnd: string;
  officeOpenDays: WeekdayId[];
  /** Days crews schedule moves — may differ from office (e.g. include Saturday). */
  crewWorkingDays: WeekdayId[];
  weekStartsOn: WeekStartsOn;
};

export type WorkspaceCompany = {
  id: string;
  /** Display / brand name (often matches branding settings). */
  name: string;
  legalName: string;
  website: string;
};

export type WorkspaceConfig = {
  company: WorkspaceCompany;
  locations: WorkspaceLocation[];
  calendar: WorkspaceCalendarConfig;
};

/** `all` = owner/manager multi-branch view; otherwise a single location id. */
export type ActiveLocationScope = string | "all";

export type WorkspaceRole = "owner" | "admin" | "manager" | "sales" | "operations" | "crew";

export type UserWorkspaceMembership = {
  companyId: string;
  role: WorkspaceRole;
  primaryLocationId: string;
  /** `all` or explicit location ids the user may switch to. */
  locationAccess: "all" | string[];
};

export type LocationSettingsOverrides = {
  hourlyCrewRate?: number | null;
  travelFee?: number | null;
  localPhone?: string | null;
  localEmail?: string | null;
  quoteTemplateId?: string | null;
};
