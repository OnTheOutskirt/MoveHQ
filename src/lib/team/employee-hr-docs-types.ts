export const EMPLOYEE_HR_DOC_KINDS = ["write_up", "warning", "improvement_plan"] as const;

export type EmployeeHrDocKind = (typeof EMPLOYEE_HR_DOC_KINDS)[number];

export const EMPLOYEE_HR_DOC_STATUSES = ["active", "acknowledged", "closed"] as const;

export type EmployeeHrDocStatus = (typeof EMPLOYEE_HR_DOC_STATUSES)[number];

export type EmployeeHrDoc = {
  id: string;
  memberId: string;
  kind: EmployeeHrDocKind;
  title: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  description: string;
  /** Optional follow-up or review date */
  followUpDate?: string;
  status: EmployeeHrDocStatus;
  documentedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
};

export const EMPLOYEE_HR_DOC_KIND_LABELS: Record<EmployeeHrDocKind, string> = {
  write_up: "Write-up",
  warning: "Warning",
  improvement_plan: "Improvement plan",
};

export const EMPLOYEE_HR_DOC_STATUS_LABELS: Record<EmployeeHrDocStatus, string> = {
  active: "Active",
  acknowledged: "Acknowledged",
  closed: "Closed",
};
