import { formatFtaSlot } from "./fta";
import { resolveMoveIdForCalendarLabel } from "./resolve-move-link";
import type { DayPipelineRow, DayPipelineStage, FtaSlot } from "./types";

function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const BOOKED_NAMES = [
  "Chen Family",
  "Walsh Office Relocation",
  "Angela Brooks",
  "Northside Dental",
  "Rebecca Holt",
];

const OPEN_NAMES = [
  "Peterson Estate",
  "James Okonkwo",
  "Marcus & Dana Ellis",
  "Sarah & Tom Walsh",
  "Tyler Nguyen",
];

export const pipelineStageLabel: Record<DayPipelineStage, string> = {
  booked: "Booked",
  lead_in: "Lead in",
  contacted: "Contacted",
  proposal_sent: "Proposal sent",
};

const STAGE_SORT_ORDER: Record<DayPipelineStage, number> = {
  booked: 0,
  proposal_sent: 1,
  contacted: 2,
  lead_in: 3,
};

export function sortPipelineRows(rows: DayPipelineRow[]): DayPipelineRow[] {
  return [...rows].sort(
    (a, b) => STAGE_SORT_ORDER[a.stage] - STAGE_SORT_ORDER[b.stage],
  );
}

export function buildDayPipeline(
  seed: number,
  fill: number,
  ftas: FtaSlot[],
): DayPipelineRow[] {
  const rows: DayPipelineRow[] = [];
  const ftaLabel = ftas.length > 0 ? formatFtaSlot(ftas[0]) : null;

  if (fill >= 0.35) {
    const bookedCount =
      fill > 0.85 ? 2 + Math.floor(seeded(seed + 40) * 2) : 1 + Math.floor(seeded(seed + 41) * 2);
    for (let i = 0; i < bookedCount; i++) {
      const s = seed + 50 + i * 7;
      const usesFta = ftas.length > 0 && seeded(s + 3) > 0.55;
      const personName = BOOKED_NAMES[(seed + i) % BOOKED_NAMES.length]!;
      rows.push({
        id: `booked-${seed}-${i}`,
        personName,
        movers: 2 + Math.floor(seeded(s) * 4),
        trucks: 1 + Math.floor(seeded(s + 1) * 2),
        estHours: 4 + Math.floor(seeded(s + 2) * 6),
        stage: "booked",
        fta: usesFta ? ftaLabel : null,
        moveId: resolveMoveIdForCalendarLabel(personName),
      });
    }
  }

  if (fill >= 0.2 && fill <= 0.95) {
    const openCount = 1 + Math.floor(seeded(seed + 60) * 3);
    const openStages: DayPipelineStage[] = ["lead_in", "contacted", "proposal_sent"];
    for (let i = 0; i < openCount; i++) {
      const s = seed + 70 + i * 11;
      const personName = OPEN_NAMES[(seed + i) % OPEN_NAMES.length]!;
      rows.push({
        id: `open-${seed}-${i}`,
        personName,
        movers: 2 + Math.floor(seeded(s) * 3),
        trucks: 1 + Math.floor(seeded(s + 1) * 2),
        estHours: 3 + Math.floor(seeded(s + 2) * 8),
        stage: openStages[Math.floor(seeded(s + 4) * openStages.length)],
        fta: null,
        moveId: resolveMoveIdForCalendarLabel(personName),
      });
    }
  }

  return sortPipelineRows(rows);
}
