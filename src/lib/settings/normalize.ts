import { normalizeTerminology } from "@/lib/terminology/normalize";
import { defaultSettings } from "./defaults";
import type { AppSettings } from "./types";

export function normalizeAppSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  if (!raw) return defaultSettings;
  return {
    branding: { ...defaultSettings.branding, ...raw.branding },
    company: { ...defaultSettings.company, ...raw.company },
    defaults: { ...defaultSettings.defaults, ...raw.defaults },
    terminology: normalizeTerminology(raw.terminology),
  };
}
