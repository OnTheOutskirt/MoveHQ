export type CrewResourceLink = {
  id: string;
  label: string;
  description?: string;
  url: string;
  category: "payroll" | "benefits" | "other";
};

export type CrewResourcesConfig = {
  links: CrewResourceLink[];
};

export const DEFAULT_CREW_RESOURCES: CrewResourcesConfig = {
  links: [
    {
      id: "cr-payroll",
      label: "Rippling payroll",
      description: "Pay stubs, W-2, direct deposit",
      url: "https://app.rippling.com",
      category: "payroll",
    },
    {
      id: "cr-health",
      label: "Health insurance portal",
      description: "Medical, dental, vision",
      url: "https://example.com/benefits",
      category: "benefits",
    },
    {
      id: "cr-401k",
      label: "401(k)",
      description: "Retirement account",
      url: "https://example.com/401k",
      category: "benefits",
    },
  ],
};

const STORAGE_KEY = "jm-crew-resources-config-v1";

export function readCrewResourcesConfig(): CrewResourcesConfig {
  if (typeof window === "undefined") return DEFAULT_CREW_RESOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CREW_RESOURCES;
    const parsed = JSON.parse(raw) as CrewResourcesConfig;
    return { links: parsed.links?.length ? parsed.links : DEFAULT_CREW_RESOURCES.links };
  } catch {
    return DEFAULT_CREW_RESOURCES;
  }
}

export function writeCrewResourcesConfig(config: CrewResourcesConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
