import type { CrewRole, DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";

export type FleetCrewMember = DispatchCrewMember & {
  active: boolean;
  /** Links to Settings → Team Members when set */
  teamMemberId?: string;
};

export type FleetTruck = DispatchTruck & {
  active: boolean;
};

export const TRUCK_TYPES = ["26ft", "enterprise", "box", "cab", "shuttle"] as const;
export type TruckType = (typeof TRUCK_TYPES)[number];

export const WEEKDAY_IDS = [0, 1, 2, 3, 4, 5, 6] as const;
export type WeekdayId = (typeof WEEKDAY_IDS)[number];

export const WEEKDAY_LABELS: Record<WeekdayId, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/** Default Mon–Fri */
export const DEFAULT_WORK_DAYS: WeekdayId[] = [1, 2, 3, 4, 5];

export type CrewWorkSchedule = {
  crewId: string;
  workDays: WeekdayId[];
};

export type TimeOffRequestStatus = "pending" | "approved" | "denied";

export type TimeOffRequest = {
  id: string;
  crewId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffRequestStatus;
  source: "crew_app" | "manual";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type TruckOutage = {
  id: string;
  truckId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type MaintenanceStatus = "scheduled" | "completed" | "overdue";

export type TruckMaintenanceRecord = {
  id: string;
  truckId: string;
  title: string;
  type: string;
  scheduledDate: string;
  status: MaintenanceStatus;
  mileage?: number;
  vendor?: string;
  notes?: string;
};

export type FleetStore = {
  crew: FleetCrewMember[];
  trucks: FleetTruck[];
  schedules: CrewWorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  truckOutages: TruckOutage[];
  maintenance: TruckMaintenanceRecord[];
};
