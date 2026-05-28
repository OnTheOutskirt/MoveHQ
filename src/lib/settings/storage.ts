import { defaultDocumentTemplates, defaultSettings } from "./defaults";
import { normalizeAppSettings } from "./normalize";
import type { AppSettings, DocumentTemplate } from "./types";

const SETTINGS_KEY = "jm-app-settings";
const TEMPLATES_KEY = "jm-app-document-templates";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return normalizeAppSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadDocumentTemplates(): DocumentTemplate[] {
  if (typeof window === "undefined") return defaultDocumentTemplates();
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return defaultDocumentTemplates();
    return JSON.parse(raw) as DocumentTemplate[];
  } catch {
    return defaultDocumentTemplates();
  }
}

export function saveDocumentTemplates(templates: DocumentTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
