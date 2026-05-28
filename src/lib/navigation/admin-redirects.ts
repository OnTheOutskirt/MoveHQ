/** Legacy ?tab= values → current admin routes (for redirects). */
export const staffTabRedirect: Record<string, string> = {
  directory: "people",
  people: "people",
  permissions: "roles",
  roles: "roles",
  access: "access",
  pay: "pay",
};

export const companyTabRedirect: Record<string, string> = {
  branding: "branding",
  company: "profile",
  profile: "profile",
  defaults: "defaults",
  notifications: "notifications",
};

export const setupTabRedirect: Record<string, string> = {
  pricing: "pricing",
  fields: "fields",
  statuses: "fields",
  integrations: "integrations",
};

export function resolveRedirectTab(
  map: Record<string, string>,
  raw: string | undefined,
  fallback: string,
): string {
  if (raw && map[raw]) return map[raw];
  return fallback;
}
