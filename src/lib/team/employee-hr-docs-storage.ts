import type { EmployeeHrDoc } from "./employee-hr-docs-types";

const STORAGE_KEY = "jm-employee-hr-docs-v1";

export function generateEmployeeHrDocId(): string {
  return `ehrd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_EMPLOYEE_HR_DOCS: EmployeeHrDoc[] = [
  {
    id: "ehrd-demo-1",
    memberId: "tm_alex",
    kind: "write_up",
    title: "Late arrival — dispatch handoff",
    date: "2026-04-22",
    description:
      "Arrived 25 minutes after shift start without notifying dispatch. Customer arrival window was at risk on a booked job.",
    followUpDate: "2026-05-22",
    status: "acknowledged",
    documentedBy: "Jonah Miller",
    acknowledgedAt: "2026-04-23T14:00:00Z",
    createdAt: "2026-04-22T16:30:00Z",
  },
  {
    id: "ehrd-demo-2",
    memberId: "tm_pat",
    kind: "warning",
    title: "Uniform policy — second notice",
    date: "2026-05-08",
    description:
      "Field visit noted non-compliant footwear on two separate job days. Verbal reminder given 4/15; this is a written warning.",
    status: "active",
    documentedBy: "Sarah Chen",
    createdAt: "2026-05-08T11:00:00Z",
  },
  {
    id: "ehrd-demo-3",
    memberId: "tm_2",
    kind: "improvement_plan",
    title: "Quote follow-up cadence",
    date: "2026-05-01",
    description:
      "30-day plan: log every follow-up in the CRM same day, respond to web quotes within 2 business hours, weekly check-in with sales manager.",
    followUpDate: "2026-06-01",
    status: "active",
    documentedBy: "Jonah Morrison",
    createdAt: "2026-05-01T09:00:00Z",
  },
];

export function loadEmployeeHrDocs(): EmployeeHrDoc[] {
  if (typeof window === "undefined") return [...DEFAULT_EMPLOYEE_HR_DOCS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_EMPLOYEE_HR_DOCS];
    const parsed = JSON.parse(raw) as EmployeeHrDoc[];
    return Array.isArray(parsed) ? parsed : [...DEFAULT_EMPLOYEE_HR_DOCS];
  } catch {
    return [...DEFAULT_EMPLOYEE_HR_DOCS];
  }
}

export function saveEmployeeHrDocs(docs: EmployeeHrDoc[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export type NewEmployeeHrDoc = Omit<EmployeeHrDoc, "id" | "createdAt">;
