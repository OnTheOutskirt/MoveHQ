import type { IntakeProgress, MoveRecord, QuoteChannel, WebsiteIntakeMeta } from "./types";

/** Move seed shape before enrichment (job days, intake, workspace fields). */
export type MoveCore = Omit<
  MoveRecord,
  | "jobDays"
  | "linkedPeople"
  | "intake"
  | "followUps"
  | "followUpDue"
  | "quoteChannel"
  | "intakeProgress"
  | "websiteIntake"
  | "lostQualification"
  | "lostReasonId"
  | "lostNotes"
  | "sentQuote"
  | "sentContract"
  | "quoteDiscount"
  | "companyId"
  | "locationId"
> & {
  companyId?: string;
  locationId?: string;
  quoteChannel?: QuoteChannel;
  intakeProgress?: IntakeProgress;
  websiteIntake?: WebsiteIntakeMeta | null;
  lostQualification?: MoveRecord["lostQualification"];
  lostReasonId?: string | null;
  lostNotes?: string | null;
};
