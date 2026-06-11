import {
  MEETING_5_28_DATE_LABEL,
  MEETING_5_28_DEFAULT_DONE_IDS,
  MEETING_5_28_GROUPS,
} from "./meeting-notes-5-28";
import {
  MEETING_6_4_DATE_LABEL,
  MEETING_6_4_DEFAULT_DONE_IDS,
  MEETING_6_4_GROUPS,
} from "./meeting-notes-6-4";
import {
  MEETING_6_8_DATE_LABEL,
  MEETING_6_8_DEFAULT_DONE_IDS,
  MEETING_6_8_GROUPS,
} from "./meeting-notes-6-8";
import {
  UI_TODO_DEFAULT_DONE_IDS,
  UI_TODO_GROUPS,
  UI_TODO_TAB_LABEL,
} from "./meeting-notes-ui-todo";
import type { PlanningGroup } from "./types";

export type MeetingNotesSession = {
  id: string;
  /** Sub-tab label in the Todo view */
  tabLabel: string;
  dateLabel: string;
  summary?: string;
  groups: PlanningGroup[];
  defaultDoneIds: readonly string[];
};

/** All todo sessions — UI backlog first, then meeting notes newest first. */
export const MEETING_NOTE_SESSIONS: MeetingNotesSession[] = [
  {
    id: "ui-todo",
    tabLabel: UI_TODO_TAB_LABEL,
    dateLabel: "UI",
    summary:
      "Remaining UI polish across MoveHQ — dashboards through crew app and shared chrome. Check off as each area is finalized.",
    groups: UI_TODO_GROUPS,
    defaultDoneIds: UI_TODO_DEFAULT_DONE_IDS,
  },
  {
    id: "meeting-6-8",
    tabLabel: `${MEETING_6_8_DATE_LABEL} meeting`,
    dateLabel: MEETING_6_8_DATE_LABEL,
    summary:
      "Move detail finalize, schedule UI, qualified leads, dispatch, claims, reporting, job actuals & Jobs sidebar, follow-ups & multi-location.",
    groups: MEETING_6_8_GROUPS,
    defaultDoneIds: MEETING_6_8_DEFAULT_DONE_IDS,
  },
  {
    id: "meeting-6-4",
    tabLabel: `${MEETING_6_4_DATE_LABEL} meeting`,
    dateLabel: MEETING_6_4_DATE_LABEL,
    summary: "Calendar, crew app media, dispatch slots, flat-rate pricing, integrations V2.",
    groups: MEETING_6_4_GROUPS,
    defaultDoneIds: MEETING_6_4_DEFAULT_DONE_IDS,
  },
  {
    id: "meeting-5-28",
    tabLabel: `${MEETING_5_28_DATE_LABEL} meeting`,
    dateLabel: MEETING_5_28_DATE_LABEL,
    summary: "Pipeline, dispatch overrides, reports, change orders, tech stack.",
    groups: MEETING_5_28_GROUPS,
    defaultDoneIds: MEETING_5_28_DEFAULT_DONE_IDS,
  },
];

/** @deprecated Use MEETING_NOTE_SESSIONS — kept for imports that expect a single date. */
export const MEETING_NOTES_DATE_LABEL = MEETING_6_8_DATE_LABEL;

export const PLANNING_TODO_TAB_LABEL = "Todo";

/** @deprecated Use PLANNING_TODO_TAB_LABEL */
export const MEETING_NOTES_TAB_LABEL = PLANNING_TODO_TAB_LABEL;

/** @deprecated Use MEETING_NOTE_SESSIONS[2].groups */
export const MEETING_NOTES_GROUPS = MEETING_5_28_GROUPS;

export function allMeetingNotesItemIds(): string[] {
  return MEETING_NOTE_SESSIONS.flatMap((session) =>
    session.groups.flatMap((g) => g.items.map((i) => i.id)),
  );
}

export const DEFAULT_MEETING_SESSION_ID = MEETING_NOTE_SESSIONS[0]!.id;

export function getMeetingSession(sessionId: string): MeetingNotesSession | undefined {
  return MEETING_NOTE_SESSIONS.find((s) => s.id === sessionId);
}

export function isMeetingSessionId(id: string): boolean {
  return MEETING_NOTE_SESSIONS.some((s) => s.id === id);
}

export function meetingNotesItemIdsForSession(sessionId: string): string[] {
  const session = getMeetingSession(sessionId);
  if (!session) return [];
  return session.groups.flatMap((g) => g.items.map((i) => i.id));
}

export function meetingSessionProgressPct(
  sessionId: string,
  progress: Record<string, boolean>,
): number {
  const ids = meetingNotesItemIdsForSession(sessionId);
  const total = ids.length;
  if (!total) return 0;
  const done = ids.filter((id) => progress[id]).length;
  return Math.round((done / total) * 100);
}

/** Meeting-note items treated as done until the user explicitly unchecks them. */
export const MEETING_NOTES_DEFAULT_DONE_IDS = [
  ...UI_TODO_DEFAULT_DONE_IDS,
  ...MEETING_5_28_DEFAULT_DONE_IDS,
  ...MEETING_6_4_DEFAULT_DONE_IDS,
  ...MEETING_6_8_DEFAULT_DONE_IDS,
] as const;
