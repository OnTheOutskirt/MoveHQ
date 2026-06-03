import type { CrewRole } from "@/lib/dispatch/types";
import type { CrewIssueStatus, CrewIssueType } from "@/lib/operations/crew-records-types";

export type CrewAppRole = CrewRole;

export type CrewAppSession = {
  crewId: string;
  name: string;
  /** Primary role for demo / default job views */
  primaryRole: CrewAppRole;
};

export type CrewAppCrewSlot = {
  role: CrewAppRole;
  name: string;
};

export type CrewAppJob = {
  id: string;
  dateKey: string;
  customerName: string;
  dayLabel: string;
  moveRef: string;
  arrivalWindow?: string;
  departureWindow?: string;
  durationLabel?: string;
  origin: string;
  destination: string;
  services: string[];
  trucks: string[];
  crew: CrewAppCrewSlot[];
  /** Role this user fills on the job */
  myRole: CrewAppRole;
  dispatchNotes?: string;
  accessNotes?: string;
  customerPhone?: string;
  publishedAt: string;
};

export type CrewAppNavId = "today" | "schedule" | "stats" | "settings";

export type CrewAppIssueSummary = {
  id: string;
  type: CrewIssueType;
  date: string;
  title: string;
  status: CrewIssueStatus;
  statusLabel: string;
};
