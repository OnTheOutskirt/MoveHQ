import type { MoveStatus } from "./types";

export type MoveStatusStyle = {
  label: string;
  badge: string;
  column: string;
  dot: string;
};

export const moveStatusConfig: Record<MoveStatus, MoveStatusStyle> = {
  new_request: {
    label: "New Request",
    badge: "bg-slate-100 text-slate-700",
    column: "border-slate-200 bg-slate-50/80",
    dot: "bg-slate-400",
  },
  waiting: {
    label: "Waiting",
    badge: "bg-blue-50 text-blue-800",
    column: "border-blue-100 bg-blue-50/50",
    dot: "bg-blue-500",
  },
  quote_sent: {
    label: "Quote Sent",
    badge: "bg-violet-50 text-violet-800",
    column: "border-violet-100 bg-violet-50/50",
    dot: "bg-violet-500",
  },
  needs_contract: {
    label: "Needs Contract",
    badge: "bg-amber-50 text-amber-900",
    column: "border-amber-100 bg-amber-50/50",
    dot: "bg-amber-500",
  },
  booked: {
    label: "Booked",
    badge: "bg-emerald-50 text-emerald-800",
    column: "border-emerald-100 bg-emerald-50/50",
    dot: "bg-emerald-500",
  },
  scheduling: {
    label: "Scheduling",
    badge: "bg-sky-50 text-sky-800",
    column: "border-sky-100 bg-sky-50/50",
    dot: "bg-sky-500",
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-brand-50 text-brand-800",
    column: "border-brand-100 bg-brand-50/50",
    dot: "bg-brand-600",
  },
  completed: {
    label: "Completed",
    badge: "bg-slate-200 text-slate-800",
    column: "border-slate-200 bg-slate-50/80",
    dot: "bg-slate-600",
  },
  lost: {
    label: "Lost",
    badge: "bg-red-50 text-red-800",
    column: "border-red-100 bg-red-50/40",
    dot: "bg-red-400",
  },
};

export function moveStatusLabel(status: MoveStatus): string {
  return moveStatusConfig[status].label;
}

/** @deprecated Use LIFECYCLE_PIPELINE_STAGES for the /moves board. Sales substeps only. */
export const PIPELINE_STATUSES: MoveStatus[] = [
  "new_request",
  "waiting",
  "quote_sent",
  "needs_contract",
  "booked",
  "lost",
];

export const ACTIVE_PIPELINE_STATUSES: MoveStatus[] = [
  "new_request",
  "waiting",
  "quote_sent",
  "needs_contract",
  "booked",
  "scheduling",
  "in_progress",
  "completed",
];

export function isActivePipeline(status: MoveStatus): boolean {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}

export function isMoveStatus(value: string): value is MoveStatus {
  return value in moveStatusConfig;
}
