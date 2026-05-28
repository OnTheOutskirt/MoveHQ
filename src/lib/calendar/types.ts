export type FtaPeriod = "morning" | "afternoon";
export type FtaDuration = "brief" | "short" | "medium";

export type FtaSlot = {
  count: number;
  crewSize: 2 | 3;
  period: FtaPeriod;
  duration: FtaDuration;
};

export type WaitlistEntry = {
  id: string;
  customerName: string;
  movers: number;
  trucks: number;
  /** Links to /moves/[id] when set or resolvable from customerName */
  moveId?: string;
};

export type HoldEntry = {
  id: string;
  customerName: string;
  movers: number;
  trucks: number;
  moveId?: string;
};

export type CrewMemberOff = {
  id: string;
  name: string;
  role: string;
};

export type DayCapacityStatus = "healthy" | "warning" | "critical" | "closed";

export type DaySalesMetrics = {
  leadsLocal: number;
  leadsLongDistance: number;
  proposalsSent: number;
  bookedJobs: number;
};

export type DayPipelineStage = "booked" | "lead_in" | "contacted" | "proposal_sent";

export type DayPipelineRow = {
  id: string;
  personName: string;
  movers: number;
  trucks: number;
  estHours: number;
  stage: DayPipelineStage;
  /** Booked moves only — FTA slot label or null */
  fta: string | null;
  moveId?: string;
};

export type CalendarDayData = {
  date: string;
  moversBooked: number;
  moversOnHold: number;
  moversCapacity: number;
  trucksBooked: number;
  trucksOnHold: number;
  trucksCapacity: number;
  importantNotes: string;
  skippersLeft: number;
  driversLeft: number;
  extraCabsLeft: number;
  f150Count: number;
  waitlistCount: number;
  waitlist: WaitlistEntry[];
  holds: HoldEntry[];
  crewOff: CrewMemberOff[];
  ftas: FtaSlot[];
  isClosed: boolean;
  /** Holiday or event name when closed (e.g. Memorial Day). */
  closedReason?: string;
  manuallyMarkedBooked: boolean;
  sales: DaySalesMetrics;
  pipeline: DayPipelineRow[];
};
