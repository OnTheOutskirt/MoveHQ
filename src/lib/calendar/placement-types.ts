export type CalendarPlacementKind = "hold" | "waitlist";

export type CalendarPlacement = {
  id: string;
  moveId: string;
  customerName: string;
  /** ISO date key (YYYY-MM-DD) */
  date: string;
  kind: CalendarPlacementKind;
  movers: number;
  trucks: number;
  createdAt: string;
  createdBy?: string;
};

export type CalendarPlacementStore = {
  version: 1;
  placements: CalendarPlacement[];
};

export type HoldDayDraft = {
  jobDayId?: string;
  date: string;
  label: string;
  movers: number;
  trucks: number;
};
