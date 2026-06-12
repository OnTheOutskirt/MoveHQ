import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { formatCrewHotelChargeSummary } from "@/lib/moves/job-day-crew-hotel";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import {
  normalizeThirdPartyServices,
  thirdPartyVendorTypeLabel,
} from "@/lib/moves/third-party-services";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { resolveVendorDirectoryLabel } from "@/lib/people/vendors";
import { defaultOpsPrepRules } from "@/lib/settings/ops-prep-rules";
import type {
  OpsPrepDueAnchor,
  OpsPrepBuiltinRuleId,
  OpsPrepRulesSettings,
} from "@/lib/settings/ops-prep-rules";
import type { ManualOpsPrepTask } from "./ops-prep-custom-storage";
import { FUTURE_LOOKAHEAD_DAYS } from "./ops-jobs";

export type OpsPrepCategory = "lodging" | "vendor" | "materials" | "logistics" | "coordination";

export type OpsPrepTask = {
  id: string;
  moveId?: string;
  customerName: string;
  jobDayId?: string;
  jobDayLabel?: string;
  dueDate: string;
  category: OpsPrepCategory;
  /** Setup vendor type — shown on manual prep items. */
  vendorTypeId?: string;
  title: string;
  detail: string;
  vendor?: string;
  vendorId?: string;
  source: string;
  /** User-added from Jobs → Ops prep. */
  isManual?: boolean;
  /** Lodging tasks require actual cost when marked done. */
  requiresActualCost?: boolean;
  clientChargeEstimate?: number;
};

export const OPS_PREP_CATEGORY_LABELS: Record<OpsPrepCategory, string> = {
  lodging: "Lodging",
  vendor: "Third party",
  materials: "Materials",
  logistics: "Logistics",
  coordination: "Coordination",
};

export function computeOpsPrepDueDate(
  anchorDate: string,
  daysBefore: number,
): string {
  return toDateKey(addDays(parseDateKey(anchorDate), -Math.max(0, daysBefore)));
}

function resolveAnchorDate(
  anchor: OpsPrepDueAnchor,
  jobDay: MoveJobDay,
  firstDay: MoveJobDay,
): string {
  return anchor === "job_day" ? jobDay.date : firstDay.date;
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

function isBuiltinEnabled(rules: OpsPrepRulesSettings, id: OpsPrepBuiltinRuleId): boolean {
  return rules.builtIn.find((rule) => rule.id === id)?.enabled ?? true;
}

function builtinRule(rules: OpsPrepRulesSettings, id: OpsPrepBuiltinRuleId) {
  return rules.builtIn.find((rule) => rule.id === id)!;
}

export type CollectOpsPrepTasksOptions = {
  today?: Date;
  rules?: OpsPrepRulesSettings;
};

/** Derive open prep work from move scope — hotels, vendors, materials, etc. */
export function collectOpsPrepTasks(
  moves: MoveRecord[],
  options: CollectOpsPrepTasksOptions | Date = {},
): OpsPrepTask[] {
  const today = options instanceof Date ? options : (options.today ?? new Date());
  const rules =
    options instanceof Date ? defaultOpsPrepRules() : (options.rules ?? defaultOpsPrepRules());
  const todayKey = toDateKey(today);
  const tasks: OpsPrepTask[] = [];
  const seen = new Set<string>();
  const explicitHotelDays = new Set<string>();

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    if (move.conditionStatus === "cancelled") continue;

    const { intake } = move;
    const days = futureJobDays(move, todayKey);
    if (days.length === 0) continue;

    const firstDay = days[0]!;
    const timing = intake.timingNotes?.trim() ?? "";
    const specialty = intake.specialtyNotes?.trim() ?? "";

    if (rules.jobDayHotel.enabled) {
      for (const day of days) {
        if (!day.crewHotel?.needed) continue;
        explicitHotelDays.add(day.id);
        const chargeSummary = day.crewHotel
          ? formatCrewHotelChargeSummary(day.crewHotel)
          : undefined;
        pushTask(tasks, seen, {
          id: `${move.id}:hotel:${day.id}`,
          moveId: move.id,
          customerName: move.customerName,
          jobDayId: day.id,
          jobDayLabel: day.label,
          dueDate: computeOpsPrepDueDate(day.date, rules.jobDayHotel.daysBefore),
          category: "lodging",
          title: "Book crew hotel",
          detail:
            day.crewHotel.notes?.trim() ||
            chargeSummary ||
            `Crew hotel for ${day.label.toLowerCase()} on ${day.date}.`,
          source: "Job day — hotel needed",
          requiresActualCost: true,
          clientChargeEstimate: day.crewHotel.clientCharge,
        });
      }
    }

    if (
      isBuiltinEnabled(rules, "timing_hotel_notes") &&
      includesAny(timing, ["hotel", "lodging", "overnight"])
    ) {
      const rule = builtinRule(rules, "timing_hotel_notes");
      const hotelDay = days.find((d) => d.services?.includes("moving")) ?? days[1] ?? firstDay;
      if (!explicitHotelDays.has(hotelDay.id)) {
        pushTask(tasks, seen, {
          id: `${move.id}:hotel:timing`,
          moveId: move.id,
          customerName: move.customerName,
          jobDayId: hotelDay.id,
          jobDayLabel: hotelDay.label,
          dueDate: computeOpsPrepDueDate(
            resolveAnchorDate(rule.anchor, hotelDay, firstDay),
            rule.daysBefore,
          ),
          category: "lodging",
          title: "Book crew hotel",
          detail: timing || `Hotel noted in timing — reserve near ${hotelDay.label.toLowerCase()}.`,
          source: "Move timing notes",
          requiresActualCost: true,
        });
      }
    }

    if (
      isBuiltinEnabled(rules, "long_distance_hotel") &&
      move.moveType === "Long distance" &&
      days.length >= 2
    ) {
      const rule = builtinRule(rules, "long_distance_hotel");
      const hotelDay = days.find((d) => d.services?.includes("moving")) ?? days[1] ?? firstDay;
      if (!explicitHotelDays.has(hotelDay.id)) {
        pushTask(tasks, seen, {
          id: `${move.id}:hotel:ld:${hotelDay.id}`,
          moveId: move.id,
          customerName: move.customerName,
          jobDayId: hotelDay.id,
          jobDayLabel: hotelDay.label,
          dueDate: computeOpsPrepDueDate(
            resolveAnchorDate(rule.anchor, hotelDay, firstDay),
            rule.daysBefore,
          ),
          category: "lodging",
          title: "Book crew hotel",
          detail: `Long-distance ${days.length}-day job — reserve hotel near ${hotelDay.label.toLowerCase()}.`,
          source: "Long distance multi-day",
          requiresActualCost: true,
        });
      }
    }

    if (isBuiltinEnabled(rules, "storage") && includesAny(timing, ["storage", "vault", "sitelink"])) {
      const rule = builtinRule(rules, "storage");
      pushTask(tasks, seen, {
        id: `${move.id}:storage`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(rule.anchor, firstDay, firstDay),
          rule.daysBefore,
        ),
        category: "logistics",
        title: "Confirm storage access",
        detail: timing || "Storage leg on this move — confirm unit and access window.",
        source: "Move timing notes",
      });
    }

    if (
      isBuiltinEnabled(rules, "specialty_vendor") &&
      (intake.hasSpecialtyItems ||
        includesAny(specialty, ["piano", "crating", "antique", "safe", "glass"]))
    ) {
      const hasThirdPartySpecialty = normalizeThirdPartyServices(intake.thirdPartyServices).some(
        (line) => line.serviceTypeId === "special_services",
      );
      if (!hasThirdPartySpecialty) {
        const rule = builtinRule(rules, "specialty_vendor");
        pushTask(tasks, seen, {
          id: `${move.id}:shamrock-crating`,
          moveId: move.id,
          customerName: move.customerName,
          dueDate: computeOpsPrepDueDate(
            resolveAnchorDate(rule.anchor, firstDay, firstDay),
            rule.daysBefore,
          ),
          category: "vendor",
          title: "Reserve specialty vendor",
          detail:
            specialty ||
            "Specialty / high-value items on move — coordinate third-party crating or haul.",
          source: "Specialty & high-value",
        });
      }
    }

    for (const line of normalizeThirdPartyServices(intake.thirdPartyServices)) {
      const vendorRule = rules.vendorTypes.find((r) => r.vendorTypeId === line.serviceTypeId);
      if (vendorRule && !vendorRule.enabled) continue;

      const daysBefore = vendorRule?.daysBefore ?? 5;
      const anchor = vendorRule?.anchor ?? "first_job_day";
      const anchorDay = anchor === "job_day" ? firstDay : firstDay;
      const vendorName = resolveVendorDirectoryLabel(line.vendorDirectoryId);
      const typeLabel = thirdPartyVendorTypeLabel(line);
      pushTask(tasks, seen, {
        id: `${move.id}:tps:${line.id}`,
        moveId: move.id,
        customerName: move.customerName,
        jobDayId: anchorDay.id,
        jobDayLabel: anchorDay.label,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(anchor, anchorDay, firstDay),
          daysBefore,
        ),
        category: "vendor",
        title: vendorName ? `Book ${vendorName}` : `Book ${typeLabel} vendor`,
        detail:
          line.notes?.trim() ||
          `${typeLabel} on this move — confirm scope, schedule, and PO.`,
        vendor: vendorName || undefined,
        vendorId: line.vendorDirectoryId ?? undefined,
        source: "Third-party services",
      });
    }

    if (isBuiltinEnabled(rules, "appliance_referral") && intake.applianceDisconnectHandling === "referral") {
      const rule = builtinRule(rules, "appliance_referral");
      pushTask(tasks, seen, {
        id: `${move.id}:appliance-vendor`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(rule.anchor, firstDay, firstDay),
          rule.daysBefore,
        ),
        category: "vendor",
        title: "Schedule appliance service",
        detail: "Disconnect/reconnect referral — book licensed vendor before pack day.",
        source: "Extras",
      });
    }

    if (
      isBuiltinEnabled(rules, "packing_materials") &&
      (intake.packingService === "full" || intake.packingService === "partial")
    ) {
      const rule = builtinRule(rules, "packing_materials");
      pushTask(tasks, seen, {
        id: `${move.id}:materials`,
        moveId: move.id,
        customerName: move.customerName,
        jobDayId: firstDay.id,
        jobDayLabel: firstDay.label,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(rule.anchor, firstDay, firstDay),
          rule.daysBefore,
        ),
        category: "materials",
        title: "Purchase packing materials",
        detail: `Order boxes, paper, and supplies for ${firstDay.label} (${intake.packingService} pack).`,
        source: "Packing scope",
      });
    }

    const heavyBoxes = intake.estimatedBoxCount ?? 0;
    if (
      isBuiltinEnabled(rules, "large_inventory_supplies") &&
      heavyBoxes >= 120 &&
      intake.packingService === "none"
    ) {
      const rule = builtinRule(rules, "large_inventory_supplies");
      pushTask(tasks, seen, {
        id: `${move.id}:supplies`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(rule.anchor, firstDay, firstDay),
          rule.daysBefore,
        ),
        category: "materials",
        title: "Stage stretch wrap & floor protection",
        detail: `Large inventory (~${heavyBoxes} boxes) — confirm floor runners and wrap on truck.`,
        source: "Inventory size",
      });
    }

    if (
      isBuiltinEnabled(rules, "coi") &&
      (intake.origin.access.coi?.includes("Yes") ||
        intake.destination.access.coi?.includes("Yes"))
    ) {
      const rule = builtinRule(rules, "coi");
      pushTask(tasks, seen, {
        id: `${move.id}:coi`,
        moveId: move.id,
        customerName: move.customerName,
        dueDate: computeOpsPrepDueDate(
          resolveAnchorDate(rule.anchor, firstDay, firstDay),
          rule.daysBefore,
        ),
        category: "coordination",
        title: "Send COI to building",
        detail: "Certificate of insurance required — submit to property manager before move day.",
        source: "Access / COI",
      });
    }

    if (isBuiltinEnabled(rules, "linehaul_trailer")) {
      const rule = builtinRule(rules, "linehaul_trailer");
      for (const day of days) {
        if (
          !day.truckSummary?.toLowerCase().includes("trailer") &&
          !day.truckSummary?.includes("53")
        ) {
          continue;
        }
        pushTask(tasks, seen, {
          id: `${move.id}:linehaul:${day.id}`,
          moveId: move.id,
          customerName: move.customerName,
          jobDayId: day.id,
          jobDayLabel: day.label,
          dueDate: computeOpsPrepDueDate(
            resolveAnchorDate(rule.anchor, day, firstDay),
            rule.daysBefore,
          ),
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

export function manualOpsPrepToTask(manual: ManualOpsPrepTask): OpsPrepTask {
  return {
    id: `manual:${manual.id}`,
    moveId: manual.moveId,
    customerName: manual.customerName,
    jobDayId: manual.jobDayId,
    jobDayLabel: manual.jobDayLabel,
    dueDate: manual.dueDate,
    category: manual.category,
    vendorTypeId: manual.vendorTypeId,
    title: manual.title,
    detail: manual.detail,
    vendor: manual.vendor,
    vendorId: manual.vendorId,
    source: "Added manually",
    isManual: true,
    requiresActualCost: manual.category === "lodging",
  };
}

export function mergeOpsPrepTasks(
  derived: OpsPrepTask[],
  manual: ManualOpsPrepTask[],
): OpsPrepTask[] {
  const manualTasks = manual.map(manualOpsPrepToTask);
  return [...manualTasks, ...derived].sort(
    (a, b) =>
      a.dueDate.localeCompare(b.dueDate) ||
      a.customerName.localeCompare(b.customerName),
  );
}

export function movesEligibleForOpsPrep(moves: MoveRecord[]): MoveRecord[] {
  return moves
    .filter(
      (move) =>
        !isMoveLost(move) &&
        move.conditionStatus !== "cancelled" &&
        move.jobDays.some((day) => day.status !== "cancelled"),
    )
    .sort((a, b) => a.customerName.localeCompare(b.customerName));
}

export function activeJobDaysForMove(move: MoveRecord): MoveJobDay[] {
  return move.jobDays
    .filter((day) => day.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function openOpsPrepTasks(
  tasks: OpsPrepTask[],
  doneIds: Set<string>,
): OpsPrepTask[] {
  return tasks.filter((t) => !doneIds.has(t.id));
}

export function openOpsPrepTasksDueToday(
  tasks: OpsPrepTask[],
  doneIds: Set<string>,
  todayKey: string,
): OpsPrepTask[] {
  return openOpsPrepTasks(tasks, doneIds).filter((task) => task.dueDate <= todayKey);
}

export function doneOpsPrepTasks(
  tasks: OpsPrepTask[],
  doneIds: Set<string>,
): OpsPrepTask[] {
  return tasks.filter((t) => doneIds.has(t.id));
}
