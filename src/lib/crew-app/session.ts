import type { CrewAppRole, CrewAppSession } from "./types";

const STORAGE_KEY = "jm-crew-app-session-v1";

export const DEMO_CREW_MEMBERS: { id: string; name: string; primaryRole: CrewAppRole }[] = [
  { id: "crew-alex", name: "Alex Rivera", primaryRole: "skipper" },
  { id: "crew-jordan", name: "Jordan Lee", primaryRole: "driver" },
  { id: "crew-chris", name: "Chris Morgan", primaryRole: "mover" },
  { id: "crew-sam", name: "Sam Patel", primaryRole: "mover" },
  { id: "crew-devon", name: "Devon Walsh", primaryRole: "driver" },
];

export const DEFAULT_CREW_SESSION: CrewAppSession = {
  crewId: "crew-chris",
  name: "Chris Morgan",
  primaryRole: "mover",
};

export function readCrewAppSession(): CrewAppSession {
  if (typeof window === "undefined") return DEFAULT_CREW_SESSION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CREW_SESSION;
    return { ...DEFAULT_CREW_SESSION, ...JSON.parse(raw) } as CrewAppSession;
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
  const role = searchParams.get("demoRole") as CrewAppRole | null;
  if (!crewId) return null;
  const member = DEMO_CREW_MEMBERS.find((m) => m.id === crewId);
  if (!member) return null;
  return {
    crewId: member.id,
    name: member.name,
    primaryRole: role && ["skipper", "driver", "mover"].includes(role) ? role : member.primaryRole,
  };
}
