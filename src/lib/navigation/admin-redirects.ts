/** Legacy ?tab= values → current admin routes (for redirects). */
export const staffTabRedirect: Record<string, string> = {
  directory: "people",
  people: "people",
  permissions: "roles",
  roles: "roles",
  access: "people",
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
  pipeline: "pipeline",
  fields: "pipeline",
  statuses: "pipeline",
  "pipeline-copy": "pipeline",
  terminology: "crew-app",
  documents: "documents",
  templates: "documents",
  automations: "automations",
  "follow-ups": "automations",
  followups: "automations",
  "crew-app": "crew-app",
};

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
