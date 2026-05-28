import { permissionLevelMeta } from "./permissions";
import type { PermissionLevel, TeamMemberRecord } from "./types";
import { memberDisplayName } from "./types";

export function formatPermission(level: PermissionLevel): string {
  return permissionLevelMeta[level].label;
}

export function formatPay(
  member: Pick<TeamMemberRecord, "payType" | "payRate" | "salaryAmount">,
): string {
  if (member.payType === "salary") {
    if (member.salaryAmount <= 0) return "Salary";
    return `$${member.salaryAmount.toLocaleString()}/yr`;
  }
  if (member.payRate <= 0) return "—";
  return `$${member.payRate.toFixed(2)}/hr`;
}

export { memberDisplayName };
