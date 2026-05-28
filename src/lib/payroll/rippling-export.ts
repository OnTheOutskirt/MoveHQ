import {
  RIPPLING_CSV_HEADERS,
  RIPPLING_PAYROLL_COLUMNS,
  type RipplingPayrollRow,
} from "./rippling-columns";
import type { PayPeriod, TimeEntry } from "./types";

/** Demo Rippling employee numbers — replace with directory sync later. */
const RIPPLING_EMP_NO: Record<string, string> = {
  "Marcus T.": "1001",
  "Tyler Brooks": "1002",
  "Devon Lee": "1003",
  "Alex Rivera": "2001",
  "Jordan Lee": "2002",
  "Lisa Parker": "2003",
  "Sam R.": "1004",
  "Mia Chen": "2004",
};

const WEEKLY_OT_THRESHOLD = 40;

function roundHours(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatCsvCell(value: string | number): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function splitRegularAndOvertime(totalHours: number): {
  basePayHours: number;
  overtimeHours: number;
} {
  const basePayHours = roundHours(Math.min(totalHours, WEEKLY_OT_THRESHOLD));
  const overtimeHours = roundHours(Math.max(0, totalHours - WEEKLY_OT_THRESHOLD));
  return { basePayHours, overtimeHours };
}

function emptyRipplingRow(employeeName: string): RipplingPayrollRow {
  return {
    ripplingEmpNo: RIPPLING_EMP_NO[employeeName] ?? "",
    employeeName,
    payableCashTips: "",
    mileageTravelGeneral: "",
    reimbursementPerDiem: "",
    expenseReimbursement: "",
    bonus: "",
    bonusSkipper: "",
    bonusDriver: "",
    bonusCrew: "",
    basePayHours: "",
    overtimeHours: "",
  };
}

export function buildRipplingPayrollRows(entries: TimeEntry[]): RipplingPayrollRow[] {
  const hoursByPerson = new Map<string, number>();

  for (const e of entries) {
    hoursByPerson.set(
      e.personName,
      roundHours((hoursByPerson.get(e.personName) ?? 0) + e.hours),
    );
  }

  return [...hoursByPerson.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([employeeName, totalHours]) => {
      const row = emptyRipplingRow(employeeName);
      const { basePayHours, overtimeHours } = splitRegularAndOvertime(totalHours);
      row.basePayHours = basePayHours;
      row.overtimeHours = overtimeHours;
      return row;
    });
}

export function ripplingPayrollCsvContent(rows: RipplingPayrollRow[]): string {
  const header = RIPPLING_CSV_HEADERS.join(",");
  const dataLines = rows.map((row) =>
    RIPPLING_PAYROLL_COLUMNS.map((col) => formatCsvCell(row[col.key])).join(","),
  );
  return [header, ...dataLines].join("\n");
}

export function ripplingRowDisplayValue(
  row: RipplingPayrollRow,
  key: (typeof RIPPLING_PAYROLL_COLUMNS)[number]["key"],
): string {
  const v = row[key];
  if (v === "" || v === null || v === undefined) return "—";
  if (typeof v === "number") return v.toFixed(2);
  return String(v);
}
