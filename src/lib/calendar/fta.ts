import type { FtaDuration, FtaPeriod, FtaSlot } from "./types";

/** Ms, Mb, Mm, As, Ab, Am */
export function ftaCode(period: FtaPeriod, duration: FtaDuration): string {
  const periodLetter = period === "morning" ? "M" : "A";
  const durationLetter = duration === "short" ? "s" : duration === "brief" ? "b" : "m";
  return `${periodLetter}${durationLetter}`;
}

/** e.g. (1)2As — one two-man afternoon short slot */
export function formatFtaSlot(slot: FtaSlot): string {
  return `(${slot.count})${slot.crewSize}${ftaCode(slot.period, slot.duration)}`;
}

export function formatFtaList(ftas: FtaSlot[]): string {
  return ftas.map(formatFtaSlot).join(" · ");
}

/** One green pill label per available FTA slot (matches month-view count). */
export function expandFtaPillLabels(ftas: FtaSlot[]): string[] {
  const labels: string[] = [];
  for (const slot of ftas) {
    for (let i = 0; i < slot.count; i++) {
      labels.push(formatFtaSlot({ ...slot, count: 1 }));
    }
  }
  return labels;
}
