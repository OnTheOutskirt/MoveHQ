import { DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import { defaultLocationAccessForLevel } from "./role-templates";
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

/** Per-person overrides — saved on team member; applied when email matches session (demo). */
export type CapabilityOverrides = {
  payroll?: boolean;
  executive?: boolean;
  /** Staff, company, integrations, setup — not Move HQ planning. */
  admin?: boolean;
  /** Move HQ planning roadmap — admin-only by default; managers need an explicit grant. */
  planning?: boolean;
};

export const MEMBER_STATUSES = ["active", "inactive"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const PAY_TYPES = ["hourly", "salary"] as const;
export type PayType = (typeof PAY_TYPES)[number];

export type TeamMemberRecord = {
  id: string;
  /** Rippling employee number — required for payroll CSV export; not shown on directory list. */
  ripplingEmpNo: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  jobTitles: JobTitle[];
  permissionLevel: PermissionLevel;
  capabilityOverrides?: CapabilityOverrides;
  /** Home branch for scoped roles. */
  primaryLocationId?: string;
  /** `all` or explicit branch ids. Omit to use role template default. */
  locationAccess?: "all" | string[];
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
    ripplingEmpNo: "",
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    phone: "",
    jobTitles: [],
    permissionLevel: "sales",
    capabilityOverrides: {},
    primaryLocationId: DEFAULT_PRIMARY_LOCATION_ID,
    locationAccess: defaultLocationAccessForLevel("sales"),
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

function normalizeMemberLocationAccess(
  raw: unknown,
  level: PermissionLevel,
): TeamMemberRecord["locationAccess"] {
  if (raw === "all") return "all";
  if (Array.isArray(raw)) {
    const ids = raw.filter((id): id is string => typeof id === "string" && id.length > 0);
    return ids.length > 0 ? ids : defaultLocationAccessForLevel(level);
  }
  return defaultLocationAccessForLevel(level);
}

export function normalizePermissionLevel(raw: unknown): PermissionLevel {
  const value = String(raw ?? "sales");
  if (PERMISSION_LEVELS.includes(value as PermissionLevel)) {
    return value as PermissionLevel;
  }
  return LEGACY_PERMISSION_MAP[value] ?? "sales";
}

/** Strip legacy fields when loading from older localStorage saves. */
export function normalizeMemberRecord(raw: Record<string, unknown> & { id: string }): TeamMemberRecord {
  const rawLevel = String(raw.permissionLevel ?? "sales");
  let permissionLevel = normalizePermissionLevel(raw.permissionLevel);
  let capabilityOverrides =
    raw.capabilityOverrides && typeof raw.capabilityOverrides === "object"
      ? (raw.capabilityOverrides as CapabilityOverrides)
      : undefined;
  if (rawLevel === "office") {
    permissionLevel = "operations";
    capabilityOverrides = { ...capabilityOverrides, payroll: true };
  }
  const record: TeamMemberRecord = {
    id: raw.id,
    ripplingEmpNo: String(raw.ripplingEmpNo ?? "").trim(),
    firstName: String(raw.firstName ?? ""),
    lastName: String(raw.lastName ?? ""),
    nickname: String(raw.nickname ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    jobTitles: Array.isArray(raw.jobTitles) ? (raw.jobTitles as JobTitle[]) : [],
    permissionLevel,
    capabilityOverrides,
    primaryLocationId: String(raw.primaryLocationId ?? DEFAULT_PRIMARY_LOCATION_ID),
    locationAccess: normalizeMemberLocationAccess(
      raw.locationAccess,
      permissionLevel,
    ),
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
