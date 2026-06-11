import {
  DEFAULT_OFFICE_PERSONA_ID,
  getOfficePersona,
  type OfficePersonaId,
} from "./personas";

const STORAGE_KEY = "jm-office-session-persona-v1";

export function readActivePersonaId(): OfficePersonaId {
  if (typeof window === "undefined") return DEFAULT_OFFICE_PERSONA_ID;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OFFICE_PERSONA_ID;
    return getOfficePersona(raw).id;
  } catch {
    return DEFAULT_OFFICE_PERSONA_ID;
  }
}

export function writeActivePersonaId(id: OfficePersonaId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, id);
}

export function resetActivePersonaId(): void {
  writeActivePersonaId(DEFAULT_OFFICE_PERSONA_ID);
}
