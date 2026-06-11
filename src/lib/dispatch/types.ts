import type { CrewMemberOff, FtaSlot } from "@/lib/calendar/types";
import type { DayBeforeConfirmation } from "./day-before-confirmation";
import type { DispatchFtaBooking } from "./fta";
import type { JobDayFraction, JobDayStatus, MoveJobDay } from "@/lib/moves/types";

export const CREW_ROLES = ["skipper", "driver", "mover"] as const;
export type CrewRole = (typeof CREW_ROLES)[number];

export type DispatchCrewMember = {
  id: string;
  name: string;
  roles: CrewRole[];
};

export type DispatchTruck = {
  id: string;
  label: string;
  /** box, 26ft, cab, shuttle, etc. */
  type: string;
};

export type DispatchJobSource = "move" | "calendar";

export type DispatchJob = {
  id: string;
  source: DispatchJobSource;
  moveId?: string;
  jobDayId?: string;
  customerName: string;
  date: string;
  label: string;
  status: JobDayStatus | "booked";
  arrivalWindow?: string;
  departureWindow?: string;
  durationLabel?: string;
  originSummary?: string;
  destinationSummary?: string;
  crewSizeNeeded: number;
  trucksNeeded: number;
  dispatchNotes?: string;
  accessNotes?: string;
  services?: string[];
  /** Short pin shown on card (icon) — e.g. access heads-up */
  pinnedNote?: string;
  /** Partial-day FTA slot label, e.g. (1)2As */
  ftaLabel?: string | null;
  ftaBooking?: DispatchFtaBooking;
  isFtaJob: boolean;
  dayFraction?: JobDayFraction;
  /** 1-based index among job days on the move (for multi-day label). */
  dayNumber?: number;
  totalJobDays?: number;
  /** Day-before move confirmation call — full workflow TBD. */
  dayBeforeConfirmation: DayBeforeConfirmation;
};

export type DispatchJobAssignment = {
  skipperId: string | null;
  /** One slot per truck (when crew size allows). */
  driverIds: (string | null)[];
  moverIds: (string | null)[];
  truckIds: string[];
  dispatchNotes: string;
  /** Per-job dispatch pin (card icon + sidebar) */
  jobNote: string;
  /** Operations override — null/undefined uses planned count from move/job day. */
  crewSizeOverride?: number | null;
  trucksNeededOverride?: number | null;
  /** Skipper also drives — hides driver slots; skipper badge shows S/D. */
  skipperAlsoDriver?: boolean;
  /** Other dispatch jobs paired to fill this crew-day. */
  pairedJobIds?: string[];
  /** Snapped timeline start (minutes from midnight) when ops reschedules on dispatch. */
  scheduleStartOverrideMinutes?: number | null;
};

export type DispatchDaySnapshot = {
  dateKey: string;
  jobs: DispatchJob[];
  ftas: FtaSlot[];
  ftaBookings: DispatchFtaBooking[];
  crewOffIds: string[];
  /** From move calendar — names/roles for the selected day */
  crewOff: CrewMemberOff[];
  importantNotes: string;
};

export type DispatchJobSelection = {
  jobId: string;
  moveId?: string;
  jobDay?: MoveJobDay;
};
