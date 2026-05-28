import type { CrewRole } from "./types";

const ROLE_LABELS: Record<CrewRole, string> = {
  skipper: "Skipper",
  driver: "Driver",
  mover: "Mover",
};

const ROLE_ORDER: CrewRole[] = ["skipper", "driver", "mover"];

export function crewRoleLabel(role: CrewRole): string {
  return ROLE_LABELS[role];
}

export function formatCrewRoles(roles: CrewRole[]): string {
  return ROLE_ORDER.filter((r) => roles.includes(r))
    .map((r) => ROLE_LABELS[r])
    .join(" · ");
}

export function crewRoleBadgeClass(role: CrewRole): string {
  switch (role) {
    case "skipper":
      return "bg-violet-100 text-violet-800";
    case "driver":
      return "bg-sky-100 text-sky-800";
    case "mover":
      return "bg-slate-100 text-slate-700";
  }
}

export function crewRoleInitial(role: CrewRole): string {
  switch (role) {
    case "skipper":
      return "S";
    case "driver":
      return "D";
    case "mover":
      return "M";
  }
}
