import type { CrewRole } from "@/lib/dispatch/types";
import type { CrewIssueStatus, CrewIssueKind, CrewIssueSubject } from "@/lib/operations/crew-records-types";

export type CrewAppRole = CrewRole;

export type CrewJobPricingType = "hourly" | "flat";

export type CrewJobMoveType = "local" | "long_distance";

export type CrewAppSession = {
  crewId: string;
  name: string;
  /** Role on today's job — workflow, pricing visibility, addresses on job detail */
  jobRole: CrewAppRole;
  /** Profile roles — stats sections, inventory on Today, etc. Can include multiple. */
  appRoles: CrewAppRole[];
};

export type CrewAppCrewSlot = {
  role: CrewAppRole;
  name: string;
};

export type CrewJobMaterial = {
  id: string;
  label: string;
  qty: number;
  unit?: string;
  /** Billable price per unit when used on the job */
  unitPrice?: number;
};

export type CrewJobOfficeFee = {
  id: string;
  label: string;
  amount: number;
  /** hourly-only fees affect hourly billing; both tracked for costing */
  appliesTo: "hourly" | "both";
};

export type CrewAppJob = {
  id: string;
  /** Move record id — used for claims routing from field captures */
  moveId?: string;
  dateKey: string;
  customerName: string;
  dayLabel: string;
  moveRef: string;
  quoteType: CrewJobPricingType;
  /** Local vs long distance — drives guided time clock steps */
  moveType: CrewJobMoveType;
  quoteAmount: number;
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
  shopMaterials: CrewJobMaterial[];
  boxCount: number;
  contentsSummary: string;
  liabilityCoverage: string;
  officeFees: CrewJobOfficeFee[];
  paymentCardOnFile: boolean;
  dispatchNotes?: string;
  accessNotes?: string;
  customerPhone?: string;
  publishedAt: string;
};

export type CrewAppNavId =
  | "today"
  | "schedule"
  | "stats"
  | "inbox"
  | "resources";

export type CrewAppIssueSummary = {
  id: string;
  kind: CrewIssueKind;
  subject: CrewIssueSubject;
  date: string;
  description: string;
  status: CrewIssueStatus;
  statusLabel: string;
};
