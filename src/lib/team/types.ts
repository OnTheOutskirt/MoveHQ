import { enforceAccessRules } from "./permissions";

export const JOB_TITLES = ["Manager", "Skipper", "Driver", "Mover"] as const;
export type JobTitle = (typeof JOB_TITLES)[number];

export const PERMISSION_LEVELS = [
  "admin",
  "manager",
  "sales",
  "operations",
  "crew",
] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export const MEMBER_STATUSES = ["active", "inactive"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const PAY_TYPES = ["hourly", "salary"] as const;
export type PayType = (typeof PAY_TYPES)[number];

export type TeamMemberRecord = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  jobTitles: JobTitle[];
  permissionLevel: PermissionLevel;
  hasCrewAppAccess: boolean;
  hasSoftwareAccess: boolean;
  payType: PayType;
  payRate: number;
  salaryAmount: number;
  status: MemberStatus;
};

export type TeamMemberFormData = Omit<TeamMemberRecord, "id">;

export function memberDisplayName(
  m: Pick<TeamMemberRecord, "firstName" | "lastName" | "nickname">,
): string {
  return `${m.firstName} ${m.lastName}`.trim();
}

export function createEmptyMember(): TeamMemberFormData {
  return {
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    phone: "",
    jobTitles: [],
    permissionLevel: "sales",
    hasCrewAppAccess: false,
    hasSoftwareAccess: true,
    payType: "hourly",
    payRate: 0,
    salaryAmount: 0,
    status: "active",
  };
}

const LEGACY_PERMISSION_MAP: Record<string, PermissionLevel> = {
  office: "operations",
  crew_limited: "crew",
};

export function normalizePermissionLevel(raw: unknown): PermissionLevel {
  const value = String(raw ?? "sales");
  if (PERMISSION_LEVELS.includes(value as PermissionLevel)) {
    return value as PermissionLevel;
  }
  return LEGACY_PERMISSION_MAP[value] ?? "sales";
}

/** Strip legacy fields when loading from older localStorage saves. */
export function normalizeMemberRecord(raw: Record<string, unknown> & { id: string }): TeamMemberRecord {
  const permissionLevel = normalizePermissionLevel(raw.permissionLevel);
  const record: TeamMemberRecord = {
    id: raw.id,
    firstName: String(raw.firstName ?? ""),
    lastName: String(raw.lastName ?? ""),
    nickname: String(raw.nickname ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    jobTitles: Array.isArray(raw.jobTitles) ? (raw.jobTitles as JobTitle[]) : [],
    permissionLevel,
    hasCrewAppAccess: Boolean(raw.hasCrewAppAccess),
    hasSoftwareAccess:
      permissionLevel === "crew" ? false : raw.hasSoftwareAccess !== false,
    payType: (raw.payType as PayType) ?? "hourly",
    payRate: Number(raw.payRate) || 0,
    salaryAmount: Number(raw.salaryAmount) || 0,
    status: (raw.status as MemberStatus) ?? "active",
  };
  const access = enforceAccessRules(record);
  return { ...record, ...access };
}
