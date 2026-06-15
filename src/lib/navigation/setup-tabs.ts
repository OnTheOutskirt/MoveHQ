export const SETUP_TOP_TABS = [
  { id: "sales", label: "Sales" },
  { id: "operations", label: "Operations" },
  { id: "messages", label: "Email & SMS" },
  { id: "automations", label: "Automations" },
  { id: "terminology", label: "Terminology" },
  { id: "mobile-app", label: "Mobile app" },
  { id: "import", label: "Import data" },
] as const;

export type SetupTopTabId = (typeof SETUP_TOP_TABS)[number]["id"];

export const SETUP_SALES_SECTIONS = [
  { id: "rates", label: "Rates & catalog" },
  { id: "pipeline", label: "Pipeline & fields" },
  { id: "leads", label: "Leads" },
  { id: "move-types", label: "Move types" },
  { id: "documents", label: "Documents" },
] as const;

export type SetupSalesSectionId = (typeof SETUP_SALES_SECTIONS)[number]["id"];

export const SETUP_OPERATIONS_SECTIONS = [
  { id: "lodging", label: "Crew lodging" },
  { id: "vendor-types", label: "Third-party vendor types" },
  { id: "prep-triggers", label: "Automatic prep triggers" },
] as const;

export type SetupOperationsSectionId = (typeof SETUP_OPERATIONS_SECTIONS)[number]["id"];

/** Legacy flat ?tab= values → grouped setup location. */
export const setupLegacyTabRedirect: Record<string, { tab: SetupTopTabId; section?: string }> = {
  pricing: { tab: "sales", section: "rates" },
  equipment: { tab: "sales", section: "rates" },
  supplies: { tab: "sales", section: "rates" },
  "equipment-supplies": { tab: "sales", section: "rates" },
  rates: { tab: "sales", section: "rates" },
  catalog: { tab: "sales", section: "rates" },
  pipeline: { tab: "sales", section: "pipeline" },
  fields: { tab: "sales", section: "pipeline" },
  statuses: { tab: "sales", section: "pipeline" },
  "pipeline-copy": { tab: "sales", section: "pipeline" },
  leads: { tab: "sales", section: "leads" },
  quadrants: { tab: "sales", section: "leads" },
  "lead-quadrants": { tab: "sales", section: "leads" },
  routing: { tab: "sales", section: "leads" },
  "move-types": { tab: "sales", section: "move-types" },
  movetypes: { tab: "sales", section: "move-types" },
  documents: { tab: "sales", section: "documents" },
  templates: { tab: "sales", section: "documents" },
  operations: { tab: "operations", section: "lodging" },
  "ops-prep": { tab: "operations", section: "lodging" },
  ops: { tab: "operations", section: "lodging" },
  messages: { tab: "messages" },
  "email-sms": { tab: "messages" },
  sms: { tab: "messages" },
  automations: { tab: "automations" },
  "follow-ups": { tab: "automations" },
  followups: { tab: "automations" },
  terminology: { tab: "terminology" },
  "crew-app": { tab: "mobile-app" },
  "mobile-app": { tab: "mobile-app" },
  import: { tab: "import" },
  "import-data": { tab: "import" },
};

export type SetupLocation = {
  tab: SetupTopTabId;
  section: SetupSalesSectionId | SetupOperationsSectionId | null;
};

function isSetupTopTab(value: string): value is SetupTopTabId {
  return SETUP_TOP_TABS.some((tab) => tab.id === value);
}

function isSalesSection(value: string): value is SetupSalesSectionId {
  return SETUP_SALES_SECTIONS.some((section) => section.id === value);
}

function isOperationsSection(value: string): value is SetupOperationsSectionId {
  return SETUP_OPERATIONS_SECTIONS.some((section) => section.id === value);
}

export function defaultSectionForTab(tab: SetupTopTabId): SetupSalesSectionId | SetupOperationsSectionId | null {
  if (tab === "sales") return "rates";
  if (tab === "operations") return "lodging";
  return null;
}

export function resolveSetupLocation(
  rawTab: string | null,
  rawSection: string | null,
): SetupLocation {
  const legacy = rawTab ? setupLegacyTabRedirect[rawTab] : undefined;
  if (legacy) {
    const section =
      (rawSection && legacy.tab === "sales" && isSalesSection(rawSection) && rawSection) ||
      (rawSection && legacy.tab === "operations" && isOperationsSection(rawSection) && rawSection) ||
      legacy.section ||
      defaultSectionForTab(legacy.tab);
    return {
      tab: legacy.tab,
      section:
        legacy.tab === "sales"
          ? (section as SetupSalesSectionId)
          : legacy.tab === "operations"
            ? (section as SetupOperationsSectionId)
            : null,
    };
  }

  const tab: SetupTopTabId = rawTab && isSetupTopTab(rawTab) ? rawTab : "sales";
  const defaultSection = defaultSectionForTab(tab);

  if (tab === "sales") {
    const section =
      rawSection && isSalesSection(rawSection) ? rawSection : (defaultSection as SetupSalesSectionId);
    return { tab, section };
  }

  if (tab === "operations") {
    const section =
      rawSection && isOperationsSection(rawSection)
        ? rawSection
        : (defaultSection as SetupOperationsSectionId);
    return { tab, section };
  }

  return { tab, section: null };
}

export function buildSetupHref(tab: SetupTopTabId, section?: string | null): string {
  const params = new URLSearchParams({ tab });
  const defaultSection = defaultSectionForTab(tab);
  if (section && section !== defaultSection) {
    params.set("section", section);
  }
  return `/admin/setup?${params.toString()}`;
}

export function setupLocationHref(location: SetupLocation): string {
  return buildSetupHref(location.tab, location.section);
}

export function setupLocationEquals(a: SetupLocation, b: SetupLocation): boolean {
  return a.tab === b.tab && a.section === b.section;
}

export function salesSectionFromLocation(location: SetupLocation): SetupSalesSectionId {
  if (location.tab === "sales" && location.section && isSalesSection(location.section)) {
    return location.section;
  }
  return "rates";
}

export function operationsSectionFromLocation(location: SetupLocation): SetupOperationsSectionId {
  if (location.tab === "operations" && location.section && isOperationsSection(location.section)) {
    return location.section;
  }
  return "lodging";
}
