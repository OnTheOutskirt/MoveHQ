export type WorkerType = "crew" | "office";

export type TimeEntrySource = "crew_app" | "office_manual" | "manager_edit";

export type TimeEntryStatus = "pending" | "approved";

export type TimeEntry = {
  id: string;
  personName: string;
  workerType: WorkerType;
  roleLabel: string;
  date: string;
  jobRef: string | null;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  /** Paid hours after break deduction */
  hours: number;
  hourlyRate: number | null;
  status: TimeEntryStatus;
  source: TimeEntrySource;
  notes?: string;
};

export type PayPeriod = {
  id: string;
  label: string;
  start: string;
  end: string;
};

/** @deprecated Use RipplingPayrollRow — kept for internal rollups if needed */
export type PayrollExportRow = {
  personName: string;
  workerType: WorkerType;
  roleLabel: string;
  totalHours: number;
  hourlyRate: number | null;
  estimatedPay: number | null;
  entryCount: number;
};

export type { RipplingPayrollRow } from "./rippling-columns";
