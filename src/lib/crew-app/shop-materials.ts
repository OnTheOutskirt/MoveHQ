import type { CrewAppJob, CrewJobMaterial } from "./types";

export type AggregatedShopMaterial = {
  id: string;
  label: string;
  unit: string;
  totalQty: number;
  jobs: { moveRef: string; customerName: string; qty: number }[];
};

/** Sum shop load materials across all jobs assigned for the day. */
export function aggregateShopMaterials(jobs: CrewAppJob[]): AggregatedShopMaterial[] {
  const byKey = new Map<string, AggregatedShopMaterial>();

  for (const job of jobs) {
    for (const item of job.shopMaterials) {
      const key = item.label.toLowerCase();
      const existing = byKey.get(key);
      if (existing) {
        existing.totalQty += item.qty;
        existing.jobs.push({
          moveRef: job.moveRef,
          customerName: job.customerName,
          qty: item.qty,
        });
      } else {
        byKey.set(key, {
          id: item.id,
          label: item.label,
          unit: item.unit ?? "ea",
          totalQty: item.qty,
          jobs: [
            {
              moveRef: job.moveRef,
              customerName: job.customerName,
              qty: item.qty,
            },
          ],
        });
      }
    }
  }

  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function materialSummaryLine(m: CrewJobMaterial): string {
  return `${m.qty} ${m.unit ?? "ea"}`;
}

export function materialDayKey(label: string): string {
  return label.trim().toLowerCase();
}
