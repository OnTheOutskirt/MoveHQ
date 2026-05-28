/** Rippling payroll import columns — `csvHeader` must match Rippling exactly. */
export const RIPPLING_PAYROLL_COLUMNS = [
  { key: "ripplingEmpNo", csvHeader: "Rippling Emp No", uiHeader: "Emp #" },
  { key: "employeeName", csvHeader: "Employee Name", uiHeader: "Employee" },
  { key: "payableCashTips", csvHeader: "Payable Cash Tips", uiHeader: "Cash tips" },
  {
    key: "mileageTravelGeneral",
    csvHeader: "Mileage-Travel General",
    uiHeader: "Mileage / travel",
  },
  {
    key: "reimbursementPerDiem",
    csvHeader: "Reimbursement Per Diem",
    uiHeader: "Per diem",
  },
  {
    key: "expenseReimbursement",
    csvHeader: "Expense Reimbursement",
    uiHeader: "Expense reimb.",
  },
  { key: "bonus", csvHeader: "Bonus", uiHeader: "Bonus" },
  { key: "bonusSkipper", csvHeader: "Bonus-Skipper", uiHeader: "Bonus · skipper" },
  { key: "bonusDriver", csvHeader: "Bonus-Driver", uiHeader: "Bonus · driver" },
  { key: "bonusCrew", csvHeader: "Bonus-Crew", uiHeader: "Bonus · crew" },
  { key: "basePayHours", csvHeader: "Base Pay Hours", uiHeader: "Base hours" },
  { key: "overtimeHours", csvHeader: "Overtime Hours", uiHeader: "OT hours" },
] as const;

export type RipplingPayrollFieldKey = (typeof RIPPLING_PAYROLL_COLUMNS)[number]["key"];

export type RipplingPayrollRow = Record<RipplingPayrollFieldKey, string | number>;

export const RIPPLING_CSV_HEADERS = RIPPLING_PAYROLL_COLUMNS.map((c) => c.csvHeader);
