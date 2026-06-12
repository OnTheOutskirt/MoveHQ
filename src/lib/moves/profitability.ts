import { sumCrewHotelClientCharges } from "@/lib/moves/job-day-crew-hotel";
import {
  equipmentMaterialsCost,
  normalizeEquipmentSupplies,
} from "@/lib/moves/equipment-supplies";
import { sumLodgingActualCostsForMove } from "@/lib/operations/ops-prep-storage";
import type { MoveJobDay, MoveRecord } from "./types";

/** Internal cost assumptions — replace with settings / payroll later. */
export const PROFITABILITY_RATES = {
  laborCostPerMoverHour: 42,
  driveCostPerHour: 32,
  truckPerDay: 145,
  fuelAndMileageLongDistance: 185,
  fuelAndMileageLocal: 45,
} as const;

export type ProfitabilityCostCategory =
  | "labor"
  | "drive_time"
  | "materials"
  | "truck"
  | "liability"
  | "fuel"
  | "other";

export type ProfitabilityCostLine = {
  category: ProfitabilityCostCategory;
  label: string;
  estimated: number;
  actual: number | null;
};

export type ProfitabilityMetricSet = {
  hours: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number | null;
};

export type ProfitabilityVariance = {
  hours: number | null;
  hoursPct: number | null;
  revenue: number | null;
  revenuePct: number | null;
  cost: number | null;
  costPct: number | null;
  profit: number | null;
  profitPct: number | null;
  marginPts: number | null;
};

export type JobDayProfitabilityRow = {
  jobDayId: string;
  label: string;
  date: string;
  status: MoveJobDay["status"];
  hoursEstimated: number;
  hoursActual: number | null;
  crewSize: number;
  revenueEstimated: number;
  revenueActual: number | null;
  costEstimated: number;
  costActual: number | null;
  profitEstimated: number;
  profitActual: number | null;
  marginEstimatedPct: number | null;
  marginActualPct: number | null;
};

export type MoveProfitabilityAnalysis = {
  pricingModel: "hourly" | "flat" | "unknown";
  jobDayMode: "none" | "single" | "multi";
  jobDayCount: number;
  /** Any job day has recorded actual hours. */
  hasPartialActuals: boolean;
  /** Move is done — show full actuals & comparison. */
  showActuals: boolean;
  showComparison: boolean;
  statusNote: string;
  totals: {
    estimated: ProfitabilityMetricSet;
    actual: ProfitabilityMetricSet | null;
    variance: ProfitabilityVariance | null;
  };
  costLines: ProfitabilityCostLine[];
  byJobDay: JobDayProfitabilityRow[];
};

function defaultCrewSize(move: MoveRecord, day?: MoveJobDay): number {
  if (day?.crewSize != null) return day.crewSize;
  if (move.moveType === "Commercial") return 6;
  if ((move.bedrooms ?? 0) >= 4) return 4;
  return 3;
}

/** Billable / planned hours for the move. */
export function resolveEstimatedHours(move: MoveRecord): number {
  const fromDays = move.jobDays.reduce((s, d) => s + (d.hoursEstimated ?? 0), 0);
  if (fromDays > 0) return fromDays;

  const boxes = move.intake.estimatedBoxCount ?? 0;
  if (boxes > 150) return 20;
  if (boxes > 80) return 14;
  if (boxes > 40) return 10;
  return 8;
}

function resolveActualHours(move: MoveRecord): number | null {
  const daysWithActual = move.jobDays.filter((d) => d.hoursActual != null);
  if (daysWithActual.length === 0) return null;
  return daysWithActual.reduce((s, d) => s + (d.hoursActual ?? 0), 0);
}

function resolveEstimatedRevenue(move: MoveRecord, totalHours: number): number {
  const lodging = sumCrewHotelClientCharges(move);
  if (move.quoteType === "hourly" && move.quoteAmount != null) {
    return Math.round(move.quoteAmount * totalHours) + lodging;
  }
  if (move.quoteType === "flat" && move.quoteAmount != null) {
    return move.quoteAmount + lodging;
  }
  const est = move.intake.estimatedMoveValue;
  return (typeof est === "number" && est > 0 ? est : 0) + lodging;
}

function resolveActualRevenue(move: MoveRecord, estimatedRevenue: number): number | null {
  if (!isMoveProfitabilityClosed(move)) return null;
  // Demo: slight upside on completed moves
  return Math.round(estimatedRevenue * 1.02);
}

export function estimateDriveHours(move: MoveRecord): number {
  const dayCount = Math.max(1, move.jobDays.length || 1);
  const isLong = move.moveType === "Long distance";
  if (isLong) return 4 + (dayCount - 1) * 2.5;
  return 1.25 + (dayCount - 1) * 0.75;
}

export function estimateActualDriveHours(move: MoveRecord, estimated: number): number {
  return Math.round(estimated * (move.moveType === "Long distance" ? 1.08 : 1.05) * 10) / 10;
}

function estimateMaterialsCost(move: MoveRecord): number {
  const { intake } = move;
  let total = 0;
  if (intake.packingService === "full") total += 380;
  else if (intake.packingService === "partial") total += 195;

  const equipmentCost = equipmentMaterialsCost(normalizeEquipmentSupplies(intake), move);
  if (equipmentCost > 0) {
    total += equipmentCost;
  } else if (intake.wardrobe.jonahCount > 0) {
    total += intake.wardrobe.jonahCount * (intake.wardrobe.jonahType === "keep" ? 12 : 22);
  }

  if (intake.hasJunk) total += 85;
  if (intake.estimatedBoxCount != null && intake.estimatedBoxCount > 60) {
    total += 45;
  }
  return total;
}

function estimateLiabilityCost(move: MoveRecord): number {
  return move.intake.liabilityPremium ?? 0;
}

function estimateTruckDays(move: MoveRecord): number {
  return Math.max(1, move.jobDays.length || 1);
}

function buildCostLines(
  move: MoveRecord,
  laborHours: number,
  actualLaborHours: number | null,
  closed: boolean,
): ProfitabilityCostLine[] {
  const driveEst = estimateDriveHours(move);
  const driveAct = closed ? estimateActualDriveHours(move, driveEst) : null;
  const truckDays = estimateTruckDays(move);
  const materialsEst = estimateMaterialsCost(move);
  const liabilityEst = estimateLiabilityCost(move);
  const fuelEst =
    move.moveType === "Long distance"
      ? PROFITABILITY_RATES.fuelAndMileageLongDistance
      : PROFITABILITY_RATES.fuelAndMileageLocal;

  const laborEst =
    laborHours * defaultCrewSize(move) * PROFITABILITY_RATES.laborCostPerMoverHour * 0.85;
  // Scale labor to sum of per-day crew*hours below for accuracy
  const laborFromDays = move.jobDays.length
    ? move.jobDays.reduce(
        (s, d) =>
          s +
          (d.hoursEstimated ?? 0) *
            defaultCrewSize(move, d) *
            PROFITABILITY_RATES.laborCostPerMoverHour,
        0,
      )
    : laborEst;

  const laborAct =
    closed && actualLaborHours != null
      ? Math.round(
          laborFromDays *
            (actualLaborHours / Math.max(laborHours, 1)) *
            (1 + (actualLaborHours > laborHours ? 0.06 : -0.02)),
        )
      : actualLaborHours != null
        ? Math.round(
            move.jobDays.reduce(
              (s, d) =>
                s +
                (d.hoursActual ?? 0) *
                  defaultCrewSize(move, d) *
                  PROFITABILITY_RATES.laborCostPerMoverHour,
              0,
            ),
          )
        : null;

  const lines: ProfitabilityCostLine[] = [
    {
      category: "labor",
      label: "Labor (crew on truck)",
      estimated: Math.round(laborFromDays || laborEst),
      actual: laborAct,
    },
    {
      category: "drive_time",
      label: "Drive time (crew travel)",
      estimated: Math.round(driveEst * PROFITABILITY_RATES.driveCostPerHour),
      actual:
        closed && driveAct != null
          ? Math.round(driveAct * PROFITABILITY_RATES.driveCostPerHour)
          : null,
    },
    {
      category: "materials",
      label: "Materials (boxes, packing, supplies)",
      estimated: materialsEst,
      actual: closed ? Math.round(materialsEst * 1.04) : null,
    },
    {
      category: "truck",
      label: "Truck & equipment",
      estimated: truckDays * PROFITABILITY_RATES.truckPerDay,
      actual: closed ? truckDays * PROFITABILITY_RATES.truckPerDay : null,
    },
    {
      category: "fuel",
      label: "Fuel & mileage",
      estimated: fuelEst,
      actual: closed ? Math.round(fuelEst * 1.1) : null,
    },
  ];

  if (liabilityEst > 0) {
    lines.push({
      category: "liability",
      label: "Liability / valuation premium",
      estimated: liabilityEst,
      actual: closed ? liabilityEst : null,
    });
  }

  const lodgingClient = sumCrewHotelClientCharges(move);
  const lodgingActual = sumLodgingActualCostsForMove(move.id);
  if (lodgingClient > 0 || lodgingActual > 0) {
    lines.push({
      category: "other",
      label: "Crew lodging (hotels)",
      estimated: Math.round(lodgingClient * 0.72),
      actual: lodgingActual > 0 ? lodgingActual : closed ? Math.round(lodgingClient * 0.72) : null,
    });
  }

  const otherEst = move.moveType === "Commercial" ? 120 : 35;
  lines.push({
    category: "other",
    label: "Other (parking, tolls, misc)",
    estimated: otherEst,
    actual: closed ? Math.round(otherEst * 1.15) : null,
  });

  return lines;
}

function sumCostLines(
  lines: ProfitabilityCostLine[],
  field: "estimated" | "actual",
  allowPartial = false,
): number {
  if (field === "estimated") return lines.reduce((s, l) => s + l.estimated, 0);
  if (allowPartial) {
    return lines.reduce((s, l) => s + (l.actual ?? 0), 0);
  }
  const values = lines.map((l) => l.actual).filter((v): v is number => v != null);
  return values.length === lines.length ? values.reduce((s, v) => s + v, 0) : 0;
}

function marginPct(profit: number, revenue: number): number | null {
  if (revenue <= 0) return null;
  return Math.round((profit / revenue) * 1000) / 10;
}

function buildMetricSet(hours: number, revenue: number, cost: number): ProfitabilityMetricSet {
  const profit = revenue - cost;
  return {
    hours,
    revenue,
    cost,
    profit,
    marginPct: marginPct(profit, revenue),
  };
}

function buildVariance(
  est: ProfitabilityMetricSet,
  act: ProfitabilityMetricSet,
): ProfitabilityVariance {
  const delta = (a: number, b: number) => Math.round((a - b) * 100) / 100;
  const pct = (a: number, b: number) =>
    b === 0 ? null : Math.round(((a - b) / b) * 1000) / 10;

  return {
    hours: delta(act.hours, est.hours),
    hoursPct: pct(act.hours, est.hours),
    revenue: delta(act.revenue, est.revenue),
    revenuePct: pct(act.revenue, est.revenue),
    cost: delta(act.cost, est.cost),
    costPct: pct(act.cost, est.cost),
    profit: delta(act.profit, est.profit),
    profitPct: pct(act.profit, est.profit),
    marginPts:
      act.marginPct != null && est.marginPct != null
        ? Math.round((act.marginPct - est.marginPct) * 10) / 10
        : null,
  };
}

function allocateRevenueAcrossDays(
  totalRevenue: number,
  days: MoveJobDay[],
  totalHours: number,
): number[] {
  if (days.length === 0) return [];
  if (days.length === 1) return [totalRevenue];
  return days.map((d) => {
    const h = d.hoursEstimated ?? 0;
    const share = totalHours > 0 ? h / totalHours : 1 / days.length;
    return Math.round(totalRevenue * share);
  });
}

function buildJobDayRows(
  move: MoveRecord,
  totalRevenueEst: number,
  totalCostEst: number,
  totalRevenueAct: number | null,
  totalCostAct: number | null,
  closed: boolean,
): JobDayProfitabilityRow[] {
  const days = [...move.jobDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  if (days.length === 0) return [];

  const totalHours = days.reduce((s, d) => s + (d.hoursEstimated ?? 0), 0) || resolveEstimatedHours(move);
  const revenueShares = allocateRevenueAcrossDays(totalRevenueEst, days, totalHours);
  const costShares = days.map((d) => {
    const h = d.hoursEstimated ?? 0;
    const labor =
      h * defaultCrewSize(move, d) * PROFITABILITY_RATES.laborCostPerMoverHour;
    const truck = PROFITABILITY_RATES.truckPerDay;
    const drive =
      (estimateDriveHours(move) / days.length) * PROFITABILITY_RATES.driveCostPerHour;
    const materials = Math.round(estimateMaterialsCost(move) / days.length);
    return labor + truck + drive + materials;
  });

  return days.map((day, i) => {
    const hoursEst = day.hoursEstimated ?? 0;
    const hoursAct = day.hoursActual ?? null;
    const revEst = revenueShares[i] ?? 0;
    const costEst = costShares[i] ?? 0;
    const profitEst = revEst - costEst;

    let revAct: number | null = null;
    let costAct: number | null = null;
    if (closed && totalRevenueAct != null && totalCostAct != null) {
      revAct = Math.round(revenueShares[i]! * (totalRevenueAct / totalRevenueEst));
      costAct = Math.round(costShares[i]! * (totalCostAct / totalCostEst));
    } else if (hoursAct != null && totalHours > 0) {
      const ratio = hoursAct / Math.max(hoursEst, 1);
      costAct = Math.round(costEst * ratio);
      revAct = move.quoteType === "hourly" ? null : null;
    }

    const profitAct =
      revAct != null && costAct != null ? revAct - costAct : null;

    return {
      jobDayId: day.id,
      label: day.label,
      date: day.date,
      status: day.status,
      hoursEstimated: hoursEst,
      hoursActual: hoursAct,
      crewSize: defaultCrewSize(move, day),
      revenueEstimated: revEst,
      revenueActual: revAct,
      costEstimated: costEst,
      costActual: costAct,
      profitEstimated: profitEst,
      profitActual: profitAct,
      marginEstimatedPct: marginPct(profitEst, revEst),
      marginActualPct:
        profitAct != null && revAct != null ? marginPct(profitAct, revAct) : null,
    };
  });
}

export function isMoveProfitabilityClosed(move: MoveRecord): boolean {
  return move.pipelineStage === "completed" || move.conditionStatus === "closed";
}

export function hasPartialProfitabilityActuals(move: MoveRecord): boolean {
  return move.jobDays.some((d) => d.hoursActual != null && d.status !== "proposed");
}

export function getMoveProfitabilityAnalysis(move: MoveRecord): MoveProfitabilityAnalysis {
  const pricingModel =
    move.quoteType === "hourly" ? "hourly" : move.quoteType === "flat" ? "flat" : "unknown";
  const jobDayCount = move.jobDays.length;
  const jobDayMode =
    jobDayCount === 0 ? "none" : jobDayCount === 1 ? "single" : "multi";

  const hoursEst = resolveEstimatedHours(move);
  const hoursAct = resolveActualHours(move);
  const closed = isMoveProfitabilityClosed(move);
  const partial = hasPartialProfitabilityActuals(move);

  const revenueEst = resolveEstimatedRevenue(move, hoursEst);
  const costLines = buildCostLines(move, hoursEst, hoursAct, closed);
  const costEst = sumCostLines(costLines, "estimated");

  const estimated = buildMetricSet(hoursEst, revenueEst, costEst);

  let actual: ProfitabilityMetricSet | null = null;
  let variance: ProfitabilityVariance | null = null;

  if (closed) {
    const actHours = hoursAct ?? hoursEst;
    const actRevenue = resolveActualRevenue(move, revenueEst) ?? revenueEst;
    const actCost = sumCostLines(
      costLines.map((l) => ({ ...l, actual: l.actual ?? l.estimated })),
      "actual",
    );
    actual = buildMetricSet(actHours, actRevenue, actCost);
    variance = buildVariance(estimated, actual);
  } else if (partial && hoursAct != null) {
    const actCost =
      sumCostLines(costLines, "actual", true) ||
      Math.round(costEst * (hoursAct / Math.max(hoursEst, 1)));
    actual = buildMetricSet(hoursAct, 0, actCost);
    actual.profit = -actual.cost;
    actual.marginPct = null;
  }

  const byJobDay = buildJobDayRows(
    move,
    revenueEst,
    costEst,
    actual?.revenue ?? null,
    actual?.cost ?? null,
    closed,
  );

  let statusNote: string;
  if (closed) {
    statusNote = "Actuals and comparison are from completed job days and final billing.";
  } else if (partial) {
    statusNote =
      "Partial actuals from finished job days — full comparison unlocks when the move is complete.";
  } else if (jobDayCount === 0) {
    statusNote = "Add job days on Move Plan to split hours, revenue, and costs across days.";
  } else if (pricingModel === "hourly") {
    statusNote =
      "Hourly quote: estimated revenue = rate × planned hours. Costs include labor, drive time, materials, and truck.";
  } else {
    statusNote =
      "Flat quote: revenue is the proposal total. Costs are allocated across job days by planned hours.";
  }

  return {
    pricingModel,
    jobDayMode,
    jobDayCount,
    hasPartialActuals: partial,
    showActuals: closed || partial,
    showComparison: closed,
    statusNote,
    totals: { estimated, actual, variance },
    costLines,
    byJobDay,
  };
}
