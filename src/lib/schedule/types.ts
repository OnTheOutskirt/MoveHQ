export type StaffDepartment = "sales" | "operations";

export type StaffCalendarScope = "mine" | "company";

/** When scope is company — filter by team. Ignored for mine. */
export type StaffTeamFilter = "all" | "sales" | "ops";

export type StaffCalendarEventKind =
  | "walkthrough_in_person"
  | "walkthrough_virtual"
  | "estimate_virtual"
  | "meeting"
  | "standup"
  | "call"
  | "other";

export type StaffCalendarEventSource = "outlook" | "walkthrough" | "local";

import type { StaffCalendarRecurrence } from "./recurrence";

export type {
  RecurrenceOrdinal,
  RecurrencePatternType,
  RecurrenceRangeType,
  RecurrenceWeekday,
  StaffCalendarRecurrence,
  StaffCalendarRecurrencePattern,
  StaffCalendarRecurrenceRange,
} from "./recurrence";

export type StaffCalendarEvent = {
  id: string;
  title: string;
  dateKey: string;
  /** Minutes from local midnight */
  startMinutes: number;
  endMinutes: number;
  staffId: string;
  staffName: string;
  department: StaffDepartment;
  kind?: StaffCalendarEventKind;
  location?: string;
  notes?: string;
  recurrence?: StaffCalendarRecurrence;
  source?: StaffCalendarEventSource;
  /** Synced from Outlook when integration is live */
  outlookSynced?: boolean;
  /** Microsoft Graph event id when Outlook is connected */
  outlookEventId?: string;
  /** When sourced from a move walkthrough booking */
  moveId?: string;
};

export type StaffCalendarEventPatch = Partial<
  Pick<
    StaffCalendarEvent,
    | "title"
    | "dateKey"
    | "startMinutes"
    | "endMinutes"
    | "location"
    | "notes"
    | "recurrence"
  >
>;
