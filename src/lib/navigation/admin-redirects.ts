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
  locations: "locations",
  branches: "locations",
  defaults: "defaults",
  notifications: "notifications",
};

export const setupTabRedirect: Record<string, string> = {
  pricing: "rates",
  equipment: "rates",
  supplies: "rates",
  "equipment-supplies": "rates",
  rates: "rates",
  catalog: "rates",
  pipeline: "pipeline",
  fields: "pipeline",
  statuses: "pipeline",
  "pipeline-copy": "pipeline",
  leads: "leads",
  quadrants: "leads",
  "lead-quadrants": "leads",
  routing: "leads",
  "move-types": "move-types",
  movetypes: "move-types",
  documents: "documents",
  templates: "documents",
  terminology: "terminology",
  messages: "messages",
  "email-sms": "messages",
  sms: "messages",
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
