import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { FUTURE_LOOKAHEAD_DAYS } from "./ops-jobs";

export type OpsPrepCategory = "lodging" | "vendor" | "materials" | "logistics" | "coordination";

export type OpsPrepTask = {
  id: string;
  moveId: string;
  customerName: string;
  jobDayId?: string;
  jobDayLabel?: string;
  dueDate: string;
  category: OpsPrepCategory;
  title: string;
  detail: string;
  vendor?: string;
  source: string;
};

export const OPS_PREP_CATEGORY_LABELS: Record<OpsPrepCategory, string> = {
  lodging: "Lodging",
  vendor: "Third party",
  materials: "Materials",
  logistics: "Logistics",
  coordination: "Coordination",
};

function dueBeforeJobDay(jobDate: string, daysBefore = 1): string {
  return toDateKey(addDays(parseDateKey(jobDate), -daysBefore));
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function futureJobDays(move: MoveRecord, todayKey: string): MoveJobDay[] {
  const horizon = toDateKey(addDays(parseDateKey(todayKey), FUTURE_LOOKAHEAD_DAYS));
  return move.jobDays
    .filter((d) => d.status !== "cancelled" && d.date >= todayKey && d.date <= horizon)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function pushTask(
  tasks: OpsPrepTask[],
  seen: Set<string>,
  task: OpsPrepTask,
) {
  if (seen.has(task.id)) return;
  seen.add(task.id);
  tasks.push(task);
}

/** Derive open prep work from move scope — hotel, vendors, materials, etc. */
export function collectOpsPrepTasks(
  moves: MoveRecord[],
  today: Date = new Date(),
): OpsPrepTask[] {
  const todayKey = toDateKey(today);
  const tasks: OpsPrepTask[] = [];
  const seen = new Set<string>();

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    if (move.conditionStatus === "cancelled") continue;

    const { intake } = move;
    const days = futureJobDays(move, todayKey);
    if (days.length === 0) continue;

    const firstDay = days[0]!;
    const timing = intake.timingNotes?.trim() ?? "";
    const specialty = intake.specialtyNotes?.trim() ?? "";

    if (
      includesAny(timing, ["hotel", "lodging", "overnight"]) ||
      (move.moveType === "Long distance" && days.length >= 2)
    ) {
      const hotelDay = days.find((d) => d.services?.includes("moving")) ?? days[1] ?? firstDay;
      pushTask(tasks, seen, {
        id: `${move.id}:hotel`,
        moveId: move.id,
        customerName: move.customerName,
        jobDayId: hotelDay.id,
        jobDayLabel: hotelDay.label,
        dueDate: dueBeforeJobDay(hotelDay.date, 2),
        category: "lodging",
        title: "Book crew hotel",
        detail:
          timing ||
          `Long-distance ${days.length}-day job — reserve hotel near ${hotelDay.label.toLowerCase()}.`,
        source: "Move timing / long distance",
      });
    }

    if (includesAny(timing, ["storage", "vault", "sitelink"])) {
      pushTask(tasks, seen, {
        id: `${move.id}:storage`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: dueBeforeJobDay(firstDay.date, 3),
        category: "logistics",
        title: "Confirm storage access",
        detail: timing || "Storage leg on this move — confirm unit and access window.",
        source: "Move timing notes",
      });
    }

    if (
      intake.hasSpecialtyItems ||
      includesAny(specialty, ["piano", "crating", "antique", "safe", "glass"])
    ) {
      pushTask(tasks, seen, {
        id: `${move.id}:shamrock-crating`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: dueBeforeJobDay(firstDay.date, 5),
        category: "vendor",
        title: "Reserve Shamrock crating",
        detail:
          specialty ||
          "Specialty / high-value items on move — coordinate third-party crating.",
        vendor: "Shamrock Crating",
        source: "Specialty & high-value",
      });
    }

    if (intake.applianceDisconnectHandling === "referral") {
      pushTask(tasks, seen, {
        id: `${move.id}:appliance-vendor`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: dueBeforeJobDay(firstDay.date, 4),
        category: "vendor",
        title: "Schedule appliance service",
        detail: "Disconnect/reconnect referral — book licensed vendor before pack day.",
        source: "Extras",
      });
    }

    if (intake.packingService === "full" || intake.packingService === "partial") {
      pushTask(tasks, seen, {
        id: `${move.id}:materials`,
        moveId: move.id,
        customerName: move.customerName,
        jobDayId: firstDay.id,
        jobDayLabel: firstDay.label,
        dueDate: dueBeforeJobDay(firstDay.date, 3),
        category: "materials",
        title: "Purchase packing materials",
        detail: `Order boxes, paper, and supplies for ${firstDay.label} (${intake.packingService} pack).`,
        source: "Packing scope",
      });
    }

    const heavyBoxes = intake.estimatedBoxCount ?? 0;
    if (heavyBoxes >= 120 && intake.packingService === "none") {
      pushTask(tasks, seen, {
        id: `${move.id}:supplies`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: dueBeforeJobDay(firstDay.date, 2),
        category: "materials",
        title: "Stage stretch wrap & floor protection",
        detail: `Large inventory (~${heavyBoxes} boxes) — confirm floor runners and wrap on truck.`,
        source: "Inventory size",
      });
    }

    if (
      intake.origin.access.coi?.includes("Yes") ||
      intake.destination.access.coi?.includes("Yes")
    ) {
      pushTask(tasks, seen, {
        id: `${move.id}:coi`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: dueBeforeJobDay(firstDay.date, 5),
        category: "coordination",
        title: "Send COI to building",
        detail: "Certificate of insurance required — submit to property manager before move day.",
        source: "Access / COI",
      });
    }

    for (const day of days) {
      if (day.truckSummary?.toLowerCase().includes("trailer") || day.truckSummary?.includes("53")) {
        pushTask(tasks, seen, {
          id: `${move.id}:linehaul:${day.id}`,
          moveId: move.id,
          customerName: move.customerName,
          jobDayId: day.id,
          jobDayLabel: day.label,
          dueDate: dueBeforeJobDay(day.date, 4),
          category: "logistics",
          title: "Confirm linehaul / trailer",
          detail: `${day.truckSummary ?? "Linehaul"} for ${day.label} on ${day.date}.`,
          source: "Job day trucks",
        });
      }
    }
  }

  return tasks.sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.customerName.localeCompare(b.customerName),
  );
}

export function openOpsPrepTasks(
  tasks: OpsPrepTask[],
  doneIds: Set<string>,
): OpsPrepTask[] {
  return tasks.filter((t) => !doneIds.has(t.id));
}
