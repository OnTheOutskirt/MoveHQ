/** Legacy ?tab= values → current admin routes (for redirects). */
export const staffTabRedirect: Record<string, string> = {
  directory: "people",
  people: "people",
  permissions: "roles",
  roles: "roles",
  access: "people",
  pay: "people",
};

export const companyTabRedirect: Record<string, string> = {
  branding: "branding",
  company: "profile",
  profile: "profile",
  locations: "locations",
  branches: "locations",
  defaults: "defaults",
  notifications: "notifications",
};

export { setupLegacyTabRedirect as setupTabRedirect } from "@/lib/navigation/setup-tabs";

/** Legacy setup ?tab=integrations → dedicated integrations route. */
export const SETUP_INTEGRATIONS_PATH = "/admin/integrations";

export function resolveRedirectTab(
  map: Record<string, string>,
  raw: string | undefined,
  fallback: string,
): string {
  if (raw && map[raw]) return map[raw];
  return fallback;
}
