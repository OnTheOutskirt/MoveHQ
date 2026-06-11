import type { DashboardView } from "@/lib/dashboard/types";
import type { RoleTemplateSettings } from "@/lib/team/role-templates";
import { capabilitiesForRoleTemplate } from "@/lib/team/role-templates";
import type { CapabilityOverrides, PermissionLevel } from "@/lib/team/types";

/** Fine-grained gates — UI-only until Supabase/Vercel auth maps users → team members. */
export const CAPABILITIES = [
  "app.software",
  "app.crew",
  "nav.dashboard",
  "nav.calendar",
  "nav.schedule",
  "nav.inbox",
  "nav.sales",
  "nav.operations",
  "nav.payroll",
  "nav.reports",
  "nav.planning",
  "nav.admin",
  "dashboard.executive",
  "dashboard.manager",
  "dashboard.sales",
  "dashboard.ops",
  "reports.day",
  "reports.sales",
  "reports.operations",
  "reports.ai_quotes",
  "payroll.view",
  "payroll.approve",
  "payroll.export",
  "admin.staff",
  "admin.company",
  "admin.integrations",
  "admin.setup",
  "data.scope.company",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export type CapabilitySet = ReadonlySet<Capability>;

export type CapabilityOverrideKey = keyof CapabilityOverrides;

export type CapabilityOverrideOption = {
  key: CapabilityOverrideKey;
  label: string;
  shortLabel: string;
  description: string;
};

export const CAPABILITY_OVERRIDE_OPTIONS: CapabilityOverrideOption[] = [
  {
    key: "payroll",
    label: "Payroll & time",
    shortLabel: "Payroll",
    description: "Payroll module, time approval, and Rippling export.",
  },
  {
    key: "executive",
    label: "Executive dashboard",
    shortLabel: "Executive",
    description: "Executive home screen and day pipeline report tab.",
  },
  {
    key: "admin",
    label: "Admin settings",
    shortLabel: "Admin",
    description: "Staff, company, integrations, and setup in the sidebar.",
  },
  {
    key: "planning",
    label: "Move HQ planning",
    shortLabel: "Planning",
    description: "Internal roadmap and planning workspace.",
  },
];

export type ResolvedAccess = {
  capabilities: CapabilitySet;
  permissionLevel: PermissionLevel;
  defaultDashboardView: DashboardView;
  /** Maps legacy `ceo` query param */
  legacyDashboardAliases: Record<string, DashboardView>;
};

const ALL = new Set(CAPABILITIES);

function setOf(...caps: Capability[]): CapabilitySet {
  return new Set(caps);
}

/** Base presets per permission template — overrides applied on top. */
export function baseCapabilitiesForLevel(level: PermissionLevel): CapabilitySet {
  switch (level) {
    case "admin":
      return ALL;
    case "manager":
      return setOf(
        "app.software",
        "nav.dashboard",
        "nav.calendar",
        "nav.schedule",
        "nav.inbox",
        "nav.sales",
        "nav.operations",
        "nav.reports",
        "nav.admin",
        "admin.staff",
        "admin.company",
        "admin.integrations",
        "admin.setup",
        "dashboard.manager",
        "dashboard.sales",
        "dashboard.ops",
        "reports.day",
        "reports.sales",
        "reports.operations",
        "reports.ai_quotes",
        "data.scope.company",
      );
    case "sales":
      return setOf(
        "app.software",
        "nav.dashboard",
        "nav.calendar",
        "nav.schedule",
        "nav.inbox",
        "nav.sales",
        "nav.operations",
        "nav.reports",
        "dashboard.sales",
        "reports.sales",
        "reports.operations",
        "reports.ai_quotes",
      );
    case "operations":
      return setOf(
        "app.software",
        "app.crew",
        "nav.dashboard",
        "nav.calendar",
        "nav.schedule",
        "nav.inbox",
        "nav.sales",
        "nav.operations",
        "nav.reports",
        "dashboard.ops",
        "reports.day",
        "reports.sales",
        "reports.operations",
        "reports.ai_quotes",
      );
    case "crew":
      return setOf("app.crew");
    default:
      return setOf("app.software");
  }
}

function presetHasOverrideKey(level: PermissionLevel, key: CapabilityOverrideKey): boolean {
  const caps = baseCapabilitiesForLevel(level);
  switch (key) {
    case "payroll":
      return caps.has("nav.payroll");
    case "executive":
      return caps.has("dashboard.executive");
    case "admin":
      return caps.has("nav.admin");
    case "planning":
      return caps.has("nav.planning");
    default:
      return false;
  }
}

/** Whether an override toggle should appear on for this template (before per-person overrides). */
export function presetOverrideEnabled(
  level: PermissionLevel,
  key: CapabilityOverrideKey,
): boolean {
  return presetHasOverrideKey(level, key);
}

/** Effective on/off after applying optional per-person override. */
export function effectiveOverrideEnabled(
  level: PermissionLevel,
  overrides: CapabilityOverrides | undefined,
  key: CapabilityOverrideKey,
): boolean {
  const preset = presetHasOverrideKey(level, key);
  const value = overrides?.[key];
  if (value === true) return true;
  if (value === false) return false;
  return preset;
}

/** Set or clear an override relative to the permission template preset. */
export function setCapabilityOverride(
  level: PermissionLevel,
  overrides: CapabilityOverrides | undefined,
  key: CapabilityOverrideKey,
  enabled: boolean,
): CapabilityOverrides {
  const preset = presetHasOverrideKey(level, key);
  const next = { ...(overrides ?? {}) };
  if (enabled === preset) {
    delete next[key];
  } else {
    next[key] = enabled;
  }
  return Object.keys(next).length > 0 ? next : {};
}

function applyOverrides(
  caps: CapabilitySet,
  level: PermissionLevel,
  overrides?: CapabilityOverrides,
): CapabilitySet {
  if (!overrides) return caps;
  const next = new Set(caps);

  if (overrides.payroll === true) {
    next.add("nav.payroll");
    next.add("payroll.view");
    next.add("payroll.approve");
    next.add("payroll.export");
  } else if (overrides.payroll === false) {
    next.delete("nav.payroll");
    next.delete("payroll.view");
    next.delete("payroll.approve");
    next.delete("payroll.export");
  }

  if (overrides.executive === true) {
    next.add("dashboard.executive");
    next.add("reports.day");
  } else if (overrides.executive === false) {
    next.delete("dashboard.executive");
  }

  if (overrides.admin === true) {
    next.add("nav.admin");
    next.add("admin.staff");
    next.add("admin.company");
    next.add("admin.integrations");
    next.add("admin.setup");
  } else if (overrides.admin === false) {
    next.delete("nav.admin");
    next.delete("admin.staff");
    next.delete("admin.company");
    next.delete("admin.integrations");
    next.delete("admin.setup");
  }

  if (overrides.planning === true) {
    next.add("nav.planning");
  } else if (overrides.planning === false) {
    next.delete("nav.planning");
  }

  if (level === "crew") {
    next.delete("app.software");
    next.add("app.crew");
  }

  return next;
}

export function deriveCapabilities(
  level: PermissionLevel,
  overrides?: CapabilityOverrides,
  roleTemplates?: RoleTemplateSettings,
): CapabilitySet {
  const base = roleTemplates
    ? new Set(capabilitiesForRoleTemplate(level, roleTemplates))
    : baseCapabilitiesForLevel(level);
  return applyOverrides(base, level, overrides);
}

export function canAccess(capabilities: CapabilitySet, cap: Capability): boolean {
  return capabilities.has(cap);
}

export function defaultDashboardForLevel(level: PermissionLevel): DashboardView {
  switch (level) {
    case "admin":
      return "executive";
    case "manager":
      return "manager";
    case "sales":
      return "sales";
    case "operations":
    case "crew":
      return "ops";
    default:
      return "manager";
  }
}

export function resolveAccess(
  level: PermissionLevel,
  overrides?: CapabilityOverrides,
  roleTemplates?: RoleTemplateSettings,
): ResolvedAccess {
  const capabilities = deriveCapabilities(level, overrides, roleTemplates);
  return {
    capabilities,
    permissionLevel: level,
    defaultDashboardView: defaultDashboardForLevel(level),
    legacyDashboardAliases: { ceo: "executive" },
  };
}

export function allowedDashboardViews(capabilities: CapabilitySet): DashboardView[] {
  const views: DashboardView[] = [];
  if (capabilities.has("dashboard.executive")) views.push("executive");
  if (capabilities.has("dashboard.manager")) views.push("manager");
  if (capabilities.has("dashboard.sales")) views.push("sales");
  if (capabilities.has("dashboard.ops")) views.push("ops");
  return views;
}

export type CapabilityMeta = {
  label: string;
  description: string;
};

export const CAPABILITY_META: Record<Capability, CapabilityMeta> = {
  "app.software": {
    label: "JM dashboard",
    description: "Sign in to the office web app.",
  },
  "app.crew": {
    label: "Crew mobile app",
    description: "Field app for job days, clock-in, and wrap-up.",
  },
  "nav.dashboard": {
    label: "Dashboard",
    description: "Home screen and daily KPI summaries.",
  },
  "nav.calendar": {
    label: "Move calendar",
    description: "Capacity, bookings, and month grid.",
  },
  "nav.schedule": {
    label: "Schedule",
    description: "Staff calendars synced from Outlook.",
  },
  "nav.inbox": {
    label: "Inbox",
    description: "Messages, alerts, and office notifications.",
  },
  "nav.sales": {
    label: "Sales",
    description: "Pipeline, quotes, walkthroughs, and directory.",
  },
  "nav.operations": {
    label: "Operations",
    description: "Jobs, dispatch, crew, fleet, and inventory.",
  },
  "nav.payroll": {
    label: "Payroll & time",
    description: "Hours review, approval, and Rippling export.",
  },
  "nav.reports": {
    label: "Reports",
    description: "Analytics hub in the sidebar.",
  },
  "nav.planning": {
    label: "Planning",
    description: "Internal roadmap and Move HQ workspace.",
  },
  "nav.admin": {
    label: "Admin",
    description: "Staff, company, setup, and integrations.",
  },
  "dashboard.executive": {
    label: "Executive home",
    description: "Company-wide leadership dashboard.",
  },
  "dashboard.manager": {
    label: "Manager home",
    description: "Branch and team oversight dashboard.",
  },
  "dashboard.sales": {
    label: "Sales home",
    description: "Rep pipeline, follow-ups, and quotes.",
  },
  "dashboard.ops": {
    label: "Operations home",
    description: "Dispatch and job-day focus dashboard.",
  },
  "reports.day": {
    label: "Day pipeline",
    description: "Booked vs capacity by day.",
  },
  "reports.sales": {
    label: "Sales reports",
    description: "Quotes, conversion, and rep scorecards.",
  },
  "reports.operations": {
    label: "Operations reports",
    description: "Jobs, crew utilization, and actuals.",
  },
  "reports.ai_quotes": {
    label: "AI web quotes",
    description: "Online intake accuracy and booking review.",
  },
  "payroll.view": {
    label: "View payroll",
    description: "See hours, tips, and pay periods.",
  },
  "payroll.approve": {
    label: "Approve time",
    description: "Sign off crew and office hours.",
  },
  "payroll.export": {
    label: "Export to Rippling",
    description: "Download payroll CSV each period.",
  },
  "admin.staff": {
    label: "Staff",
    description: "People, roles, and permissions.",
  },
  "admin.company": {
    label: "Company",
    description: "Branding, locations, and defaults.",
  },
  "admin.integrations": {
    label: "Integrations",
    description: "Twilio, Stripe, Outlook, and connected services.",
  },
  "admin.setup": {
    label: "Setup",
    description: "Pricing, templates, automations, and fields.",
  },
  "data.scope.company": {
    label: "All locations",
    description: "See data across every branch, not one office.",
  },
};

export function capabilityLabel(cap: Capability): string {
  return CAPABILITY_META[cap]?.label ?? cap;
}

export function capabilityDescription(cap: Capability): string {
  return CAPABILITY_META[cap]?.description ?? "";
}
