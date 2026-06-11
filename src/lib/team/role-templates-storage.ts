import {
  defaultRoleTemplateSettings,
  normalizeRoleTemplateSettings,
  type RoleTemplateSettings,
} from "./role-templates";

const STORAGE_KEY = "jm-app-role-templates";

export function loadRoleTemplates(): RoleTemplateSettings {
  if (typeof window === "undefined") return defaultRoleTemplateSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultRoleTemplateSettings();
    return normalizeRoleTemplateSettings(JSON.parse(raw) as Partial<RoleTemplateSettings>);
  } catch {
    return defaultRoleTemplateSettings();
  }
}

export function saveRoleTemplates(settings: RoleTemplateSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function roleTemplatesSnapshot(settings: RoleTemplateSettings): string {
  return JSON.stringify(settings);
}
