import { defaultTeamMembers } from "./defaults";
import { normalizeMemberRecord, type TeamMemberRecord } from "./types";

const STORAGE_KEY = "jm-app-team-members";

export function loadTeamMembers(): TeamMemberRecord[] {
  if (typeof window === "undefined") return defaultTeamMembers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTeamMembers;
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((item) => normalizeMemberRecord(item as Record<string, unknown> & { id: string }));
  } catch {
    return defaultTeamMembers;
  }
}

export function saveTeamMembers(members: TeamMemberRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function generateMemberId(): string {
  return `tm_${Date.now().toString(36)}`;
}
