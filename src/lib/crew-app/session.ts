import type { CrewAppRole, CrewAppSession } from "./types";

const STORAGE_KEY = "jm-crew-app-session-v1";

const VALID_ROLES: CrewAppRole[] = ["skipper", "driver", "mover"];

export const DEMO_CREW_MEMBERS: { id: string; name: string; primaryRole: CrewAppRole }[] = [
  { id: "crew-alex", name: "Alex Rivera", primaryRole: "skipper" },
  { id: "crew-jordan", name: "Jordan Lee", primaryRole: "driver" },
  { id: "crew-chris", name: "Chris Morgan", primaryRole: "mover" },
  { id: "crew-sam", name: "Sam Patel", primaryRole: "mover" },
  { id: "crew-devon", name: "Devon Walsh", primaryRole: "driver" },
];

/** Fixed crew member shown in admin phone preview iframe. */
export const PREVIEW_CREW_MEMBER = DEMO_CREW_MEMBERS[0]!;

export const DEFAULT_CREW_SESSION: CrewAppSession = {
  crewId: PREVIEW_CREW_MEMBER.id,
  name: PREVIEW_CREW_MEMBER.name,
  jobRole: "skipper",
  appRoles: ["skipper"],
};

export function isValidCrewAppRole(value: string): value is CrewAppRole {
  return VALID_ROLES.includes(value as CrewAppRole);
}

export function parseJobRoleFromParams(
  searchParams: URLSearchParams,
  fallback: CrewAppRole,
): CrewAppRole {
  const jobRole = searchParams.get("demoJobRole");
  if (jobRole && isValidCrewAppRole(jobRole)) return jobRole;
  const legacy = searchParams.get("demoRole");
  if (legacy && isValidCrewAppRole(legacy)) return legacy;
  return fallback;
}

export function parseAppRolesFromParams(
  searchParams: URLSearchParams,
  fallback: CrewAppRole,
): CrewAppRole[] {
  const raw = searchParams.get("demoAppRoles");
  if (raw) {
    const roles = [...new Set(raw.split(",").filter(isValidCrewAppRole))];
    if (roles.length > 0) return roles;
  }
  const legacy = searchParams.get("demoRole");
  if (legacy && isValidCrewAppRole(legacy)) return [legacy];
  return [fallback];
}

type StoredSession = Partial<CrewAppSession> & { primaryRole?: CrewAppRole };

export function normalizeCrewAppSession(raw: StoredSession): CrewAppSession {
  const jobRole = raw.jobRole ?? raw.primaryRole ?? DEFAULT_CREW_SESSION.jobRole;
  const appRoles =
    raw.appRoles && raw.appRoles.length > 0
      ? raw.appRoles
      : raw.primaryRole
        ? [raw.primaryRole]
        : DEFAULT_CREW_SESSION.appRoles;

  return {
    crewId: raw.crewId ?? DEFAULT_CREW_SESSION.crewId,
    name: raw.name ?? DEFAULT_CREW_SESSION.name,
    jobRole,
    appRoles,
  };
}

export function readCrewAppSession(): CrewAppSession {
  if (typeof window === "undefined") return DEFAULT_CREW_SESSION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CREW_SESSION;
    return normalizeCrewAppSession(JSON.parse(raw) as StoredSession);
  } catch {
    return DEFAULT_CREW_SESSION;
  }
}

export function writeCrewAppSession(session: CrewAppSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function sessionFromDemoParams(searchParams: URLSearchParams): CrewAppSession | null {
  const crewId = searchParams.get("demoCrewId");
  if (!crewId) return null;
  const member = DEMO_CREW_MEMBERS.find((m) => m.id === crewId);
  if (!member) return null;
  return {
    crewId: member.id,
    name: member.name,
    jobRole: parseJobRoleFromParams(searchParams, member.primaryRole),
    appRoles: parseAppRolesFromParams(searchParams, member.primaryRole),
  };
}
