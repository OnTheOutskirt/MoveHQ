import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import type { CrewWorkSchedule, FleetCrewMember, TimeOffRequest } from "./fleet-types";
import { DEFAULT_WORK_DAYS } from "./fleet-types";

/** Minimum movers ops wants available before approving another mover off */
export const MIN_MOVERS_FOR_APPROVAL = 4;

export type DayImpact = {
  dateKey: string;
  label: string;
  moversAvailable: number;
  moversAfterApproval: number;
  canApprove: boolean;
  warning?: string;
};

export type TimeOffImpactResult = {
  days: DayImpact[];
  canApproveAll: boolean;
  summary: string;
};

function eachDateKeyInRange(start: string, end: string): string[] {
  const keys: string[] = [];
  let d = parseDateKey(start);
  const endD = parseDateKey(end);
  while (d <= endD) {
    keys.push(toDateKey(d));
    d = addDays(d, 1);
  }
  return keys;
}

function getWorkDays(schedules: CrewWorkSchedule[], crewId: string): number[] {
  return schedules.find((s) => s.crewId === crewId)?.workDays ?? DEFAULT_WORK_DAYS;
}

function worksOnDate(schedules: CrewWorkSchedule[], crewId: string, dateKey: string): boolean {
  const day = parseDateKey(dateKey).getDay() as number;
  return getWorkDays(schedules, crewId).includes(day);
}

function isCrewOffOnDate(
  crewId: string,
  dateKey: string,
  requests: TimeOffRequest[],
  excludeRequestId?: string,
): boolean {
  return requests.some((r) => {
    if (r.id === excludeRequestId) return false;
    if (r.crewId !== crewId) return false;
    if (r.status === "denied") return false;
    return dateKey >= r.startDate && dateKey <= r.endDate;
  });
}

function countMoversAvailable(
  dateKey: string,
  crew: FleetCrewMember[],
  schedules: CrewWorkSchedule[],
  requests: TimeOffRequest[],
  excludeRequestId?: string,
): number {
  return crew.filter((c) => {
    if (!c.active) return false;
    if (!c.roles.includes("mover")) return false;
    if (!worksOnDate(schedules, c.id, dateKey)) return false;
    if (isCrewOffOnDate(c.id, dateKey, requests, excludeRequestId)) return false;
    return true;
  }).length;
}

export function evaluateTimeOffImpact(
  request: Pick<TimeOffRequest, "id" | "crewId" | "startDate" | "endDate">,
  crew: FleetCrewMember[],
  schedules: CrewWorkSchedule[],
  requests: TimeOffRequest[],
): TimeOffImpactResult {
  const subject = crew.find((c) => c.id === request.crewId);
  const subjectIsMover = subject?.roles.includes("mover") ?? false;
  const dateKeys = eachDateKeyInRange(request.startDate, request.endDate);

  const days: DayImpact[] = dateKeys.map((dateKey) => {
    const before = countMoversAvailable(dateKey, crew, schedules, requests, request.id);
    const subjectWorks = subject ? worksOnDate(schedules, subject.id, dateKey) : false;
    const deduct = subjectIsMover && subjectWorks && subject?.active ? 1 : 0;
    const after = before - deduct;
    const canApprove = !subjectIsMover || !subjectWorks || after >= MIN_MOVERS_FOR_APPROVAL;
    const d = parseDateKey(dateKey);
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    let warning: string | undefined;
    if (subjectIsMover && subjectWorks && !canApprove) {
      warning = `Only ${after} mover${after === 1 ? "" : "s"} would remain (need ${MIN_MOVERS_FOR_APPROVAL})`;
    }
    return {
      dateKey,
      label,
      moversAvailable: before,
      moversAfterApproval: after,
      canApprove,
      warning,
    };
  });

  const canApproveAll = days.every((d) => d.canApprove);
  const blocked = days.filter((d) => !d.canApprove).length;
  const summary = canApproveAll
    ? "Approval looks OK for all days in this range."
    : blocked === days.length
      ? "Cannot approve — staffing too thin on all requested days."
      : `Cannot approve on ${blocked} of ${days.length} day(s) — review calendar below.`;

  return { days, canApproveAll, summary };
}
