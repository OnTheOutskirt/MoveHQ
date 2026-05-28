import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import type { MoveFollowUp, MoveRecord } from "@/lib/moves/types";

export const DAY_BEFORE_CONFIRMATION_STATUSES = [
  "confirmed",
  "pending",
  "attempted",
  "not_due",
] as const;

export type DayBeforeConfirmationStatus = (typeof DAY_BEFORE_CONFIRMATION_STATUSES)[number];

export type DayBeforeConfirmation = {
  status: DayBeforeConfirmationStatus;
  /** ISO date key — day the confirmation call should happen (day before job). */
  callDueDateKey: string;
  /** Short line for sidebar / cards */
  detail: string;
  confirmedAt?: string;
};

export function dayBeforeCallDueDateKey(jobDateKey: string): string {
  return toDateKey(addDays(parseDateKey(jobDateKey), -1));
}

function formatCallDueLabel(callDueKey: string): string {
  const d = parseDateKey(callDueKey);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Stable mock for calendar-only dispatch rows. */
function mockStatusFromJobId(jobId: string): DayBeforeConfirmationStatus {
  let hash = 0;
  for (let i = 0; i < jobId.length; i++) hash = (hash + jobId.charCodeAt(i)) % 997;
  const bucket = hash % 5;
  if (bucket === 0) return "confirmed";
  if (bucket === 1) return "attempted";
  return "pending";
}

function fromFollowUp(fu: MoveFollowUp, callDueKey: string): DayBeforeConfirmation | null {
  if (fu.type !== "booking_confirm") return null;
  if (fu.status === "completed") {
    return {
      status: "confirmed",
      callDueDateKey: callDueKey,
      detail: fu.result?.trim() || "Customer confirmed",
      confirmedAt: fu.dueAt,
    };
  }
  if (fu.status === "skipped") {
    return {
      status: "attempted",
      callDueDateKey: callDueKey,
      detail: fu.notes?.trim() || "Call attempted — follow up needed",
    };
  }
  return {
    status: "pending",
    callDueDateKey: callDueKey,
    detail: fu.title,
  };
}

export function resolveDayBeforeConfirmation(
  jobDateKey: string,
  options?: {
    move?: MoveRecord;
    jobDayId?: string;
    referenceDate?: Date;
    /** Manual dispatch override (local storage later). */
    override?: DayBeforeConfirmationStatus | null;
    /** Stable id for calendar-only jobs */
    jobId?: string;
  },
): DayBeforeConfirmation {
  const referenceDate = options?.referenceDate ?? new Date();
  const todayKey = toDateKey(referenceDate);
  const callDueKey = dayBeforeCallDueDateKey(jobDateKey);
  const callDueLabel = formatCallDueLabel(callDueKey);

  if (options?.override) {
    return buildConfirmation(options.override, callDueKey, callDueLabel, todayKey, jobDateKey);
  }

  if (options?.move) {
    const bookingFollowUps = options.move.followUps.filter((f) => f.type === "booking_confirm");
    const open = bookingFollowUps.find((f) => f.status === "open");
    if (open) {
      const resolved = fromFollowUp(open, callDueKey);
      if (resolved) return resolved;
    }
    const completed = bookingFollowUps.find((f) => f.status === "completed");
    if (completed) {
      const resolved = fromFollowUp(completed, callDueKey);
      if (resolved) return resolved;
    }
    const skipped = bookingFollowUps.find((f) => f.status === "skipped");
    if (skipped) {
      const resolved = fromFollowUp(skipped, callDueKey);
      if (resolved) return resolved;
    }

    const jobDay = options.jobDayId
      ? options.move.jobDays.find((d) => d.id === options.jobDayId)
      : options.move.jobDays.find((d) => d.date === jobDateKey);
    if (jobDay?.status === "proposed") {
      return {
        status: "pending",
        callDueDateKey: callDueKey,
        detail: "Job day not on calendar yet",
      };
    }
  }

  if (todayKey < callDueKey) {
    return {
      status: "not_due",
      callDueDateKey: callDueKey,
      detail: `Call due ${callDueLabel}`,
    };
  }

  if (todayKey === callDueKey) {
    return {
      status: "pending",
      callDueDateKey: callDueKey,
      detail: "Confirmation call due today",
    };
  }

  if (todayKey === jobDateKey) {
    const mock = options?.jobId ? mockStatusFromJobId(options.jobId) : "pending";
    return buildConfirmation(
      mock === "not_due" ? "pending" : mock,
      callDueKey,
      callDueLabel,
      todayKey,
      jobDateKey,
    );
  }

  if (todayKey > jobDateKey) {
    return {
      status: "confirmed",
      callDueDateKey: callDueKey,
      detail: "Move day passed",
    };
  }

  const mock = options?.jobId ? mockStatusFromJobId(options.jobId) : "pending";
  return buildConfirmation(mock, callDueKey, callDueLabel, todayKey, jobDateKey);
}

function buildConfirmation(
  status: DayBeforeConfirmationStatus,
  callDueKey: string,
  callDueLabel: string,
  todayKey: string,
  jobDateKey: string,
): DayBeforeConfirmation {
  switch (status) {
    case "confirmed":
      return {
        status,
        callDueDateKey: callDueKey,
        detail: "Customer confirmed for move day",
      };
    case "attempted":
      return {
        status,
        callDueDateKey: callDueKey,
        detail: "Called — awaiting confirmation",
      };
    case "not_due":
      return {
        status,
        callDueDateKey: callDueKey,
        detail: `Call due ${callDueLabel}`,
      };
    case "pending":
    default:
      if (todayKey > callDueKey && todayKey <= jobDateKey) {
        return {
          status: "pending",
          callDueDateKey: callDueKey,
          detail: "Confirmation call overdue",
        };
      }
      return {
        status: "pending",
        callDueDateKey: callDueKey,
        detail: todayKey === callDueKey ? "Confirmation call due today" : `Call due ${callDueLabel}`,
      };
  }
}

export const DAY_BEFORE_CONFIRMATION_LABELS: Record<DayBeforeConfirmationStatus, string> = {
  confirmed: "Confirmed",
  pending: "Needs call",
  attempted: "Attempted",
  not_due: "Not due yet",
};
