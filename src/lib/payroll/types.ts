export type WorkerType = "crew" | "office";

export type TimeEntrySource = "crew_app" | "office_clock" | "office_manual" | "manager_edit";

export type TimeEntryStatus = "pending" | "approved";

/** Hours by clock category — crew uses move/drive/extra; office staff uses office. */
export type TimeCategoryHours = {
  move: number;
  drive: number;
  extra: number;
  office: number;
  break: number;
};

export type TimeEntry = {
  id: string;
  personId: string;
  personName: string;
  workerType: WorkerType;
  roleLabel: string;
  date: string;
  jobRef: string | null;
  categories: TimeCategoryHours;
  /** Paid hours — all time except breaks (move + drive + extra + office) */
  hours: number;
  hourlyRate: number | null;
  status: TimeEntryStatus;
  source: TimeEntrySource;
  notes?: string;
  clockInAt?: string;
  clockOutAt?: string | null;
  /** Still on the clock — hours refresh until clock out */
  isLiveClock?: boolean;
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

export type TimeEntryDaySelection = {
  personId: string;
  personName: string;
  date: string;
  entries: TimeEntry[];
};

export type TipEntryStatus = "pending" | "approved";

export type TipEntrySource = "crew_app" | "customer_payment" | "manager_edit";

export type TipEntry = {
  id: string;
  personId: string;
  personName: string;
  date: string;
  jobRef: string;
  amount: number;
  status: TipEntryStatus;
  source: TipEntrySource;
  notes?: string;
};

export type TipEntryDaySelection = {
  personId: string;
  personName: string;
  date: string;
  entries: TipEntry[];
};

export type PayrollReadinessBlocker = {
  kind: "time_pending" | "tips_pending";
  message: string;
};
