import { formatMoveDate } from "@/lib/moves/format";
import { formatJobDayLocationAddress } from "@/lib/moves/job-day-locations";
import {
  applyPipelineStage,
  applyWaitingSubstage,
  moveStageDisplayLabel,
  waitingSubstageLabel,
} from "@/lib/moves/move-pipeline";
import { OFFICE_PERSONAS } from "@/lib/session/personas";
import type { StaffCalendarEvent } from "@/lib/schedule/types";
import type {
  MoveRecord,
  MoveWalkthrough,
  WalkthroughMode,
  WalkthroughScheduleDraft,
} from "./types";

export type { MoveWalkthrough, WalkthroughMode, WalkthroughScheduleDraft, WalkthroughStatus } from "./types";

export type WalkthroughListItem = {
  move: MoveRecord;
  walkthrough: MoveWalkthrough | null;
  needsScheduling: boolean;
};

const SLOT_DURATION_MIN = 90;

/** Parse activity text like "On-site walkthrough May 22 — estate contents". */
function inferWalkthroughFromActivity(move: MoveRecord): MoveWalkthrough | null {
  const activity = move.activities.find((a) =>
    a.summary.toLowerCase().includes("walkthrough"),
  );
  if (!activity) return null;

  const summary = activity.summary;
  const dateMatch = summary.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})\b/i,
  );
  const year = move.preferredDate?.slice(0, 4) ?? new Date().getFullYear().toString();
  let scheduledDate = move.preferredDate || new Date().toISOString().slice(0, 10);
  if (dateMatch) {
    const parsed = Date.parse(`${dateMatch[1]} ${dateMatch[2]}, ${year}`);
    if (!Number.isNaN(parsed)) {
      scheduledDate = new Date(parsed).toISOString().slice(0, 10);
    }
  }

  const mode: WalkthroughMode = summary.toLowerCase().includes("virtual")
    ? "virtual"
    : "in_person";

  return {
    id: `wt-${move.id}`,
    scheduledDate,
    startTime: "10:00 AM",
    assignedTo: activity.actor ?? move.assignedRep,
    mode,
    status: "scheduled",
    location: mode === "in_person" ? move.originAddress : "Video call",
    bookedAt: activity.at,
  };
}

export function resolveMoveWalkthrough(move: MoveRecord): MoveWalkthrough | null {
  if (move.scheduledWalkthrough?.status === "scheduled") {
    return move.scheduledWalkthrough;
  }
  if (move.waitingSubstage === "walkthrough_scheduled") {
    return inferWalkthroughFromActivity(move);
  }
  return null;
}

/** True when a walkthrough was booked on the move (not inferred from activity alone). */
export function hasBookedWalkthrough(move: MoveRecord): boolean {
  return move.scheduledWalkthrough?.status === "scheduled";
}

export function isWalkthroughPipelineMove(move: MoveRecord): boolean {
  if (resolveMoveWalkthrough(move) != null) return true;
  if (move.pipelineStage !== "waiting") return false;
  return (
    move.waitingSubstage === "needs_walkthrough" ||
    move.waitingSubstage === "walkthrough_scheduled"
  );
}

function isEligibleForWalkthroughScheduling(move: MoveRecord): boolean {
  return (
    move.conditionStatus !== "lost" &&
    move.conditionStatus !== "cancelled" &&
    move.conditionStatus !== "closed"
  );
}

export function searchMovesForWalkthrough(
  moves: MoveRecord[],
  query: string,
  limit = 10,
): MoveRecord[] {
  const eligible = moves
    .filter(isEligibleForWalkthroughScheduling)
    .slice()
    .sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));

  const q = query.trim().toLowerCase();
  if (!q) return eligible.slice(0, limit);

  return eligible
    .filter((move) => {
      const haystack = [
        move.reference,
        move.customerName,
        move.customerPhone,
        move.customerEmail,
        move.originAddress,
        move.destinationAddress,
        move.moveType,
        move.assignedRep,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}

export function buildWalkthroughListItems(moves: MoveRecord[]): WalkthroughListItem[] {
  return moves
    .filter(isWalkthroughPipelineMove)
    .map((move) => {
      const walkthrough = resolveMoveWalkthrough(move);
      const needsScheduling =
        move.waitingSubstage === "needs_walkthrough" || walkthrough == null;
      return { move, walkthrough, needsScheduling };
    });
}

export function filterWalkthroughsByAssignee(
  items: WalkthroughListItem[],
  assignee: string,
): WalkthroughListItem[] {
  if (assignee === "all") return items;
  return items.filter((item) => {
    const who = item.walkthrough?.assignedTo ?? item.move.assignedRep;
    return who === assignee;
  });
}

export function sortWalkthroughListItems(items: WalkthroughListItem[]): WalkthroughListItem[] {
  return [...items].sort((a, b) => {
    if (a.needsScheduling !== b.needsScheduling) {
      return a.needsScheduling ? 1 : -1;
    }
    const dateA = a.walkthrough?.scheduledDate ?? a.move.preferredDate ?? "9999";
    const dateB = b.walkthrough?.scheduledDate ?? b.move.preferredDate ?? "9999";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return a.move.customerName.localeCompare(b.move.customerName);
  });
}

export function walkthroughAssigneesFromMoves(moves: MoveRecord[]): string[] {
  const names = new Set<string>();
  for (const move of moves) {
    names.add(move.assignedRep);
    const wt = resolveMoveWalkthrough(move);
    if (wt?.assignedTo) names.add(wt.assignedTo);
  }
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 9 * 60;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]!.toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatWalkthroughMode(mode: WalkthroughMode): string {
  return mode === "virtual" ? "Virtual" : "In person";
}

export function formatWalkthroughScheduleLine(walkthrough: MoveWalkthrough): string {
  return formatWalkthroughDateTime(walkthrough.scheduledDate, walkthrough.startTime);
}

export function formatWalkthroughDateTime(scheduledDate: string, startTime: string): string {
  return `${formatMoveDate(scheduledDate)} at ${startTime}`;
}

export function formatWalkthroughDetails(walkthrough: MoveWalkthrough): string {
  const parts = [
    formatWalkthroughMode(walkthrough.mode),
    walkthrough.assignedTo,
    walkthrough.location,
  ].filter(Boolean);
  return parts.join(" · ");
}

function applyWalkthroughPipelineStage(move: MoveRecord): {
  move: MoveRecord;
  pipelineActivity: string | null;
} {
  if (move.pipelineStage === "new_lead") {
    const next = applyPipelineStage(move, "waiting", "walkthrough_scheduled");
    return {
      move: next,
      pipelineActivity: `Pipeline → ${moveStageDisplayLabel(next)}`,
    };
  }
  if (
    move.pipelineStage === "waiting" &&
    move.waitingSubstage !== "walkthrough_scheduled"
  ) {
    const next = applyWaitingSubstage(move, "walkthrough_scheduled");
    return {
      move: next,
      pipelineActivity: `Waiting → ${waitingSubstageLabel("walkthrough_scheduled")}`,
    };
  }
  return { move, pipelineActivity: null };
}

/** Starting address for walkthrough — Day 1 origin on the move, else intake/origin. */
export function walkthroughDayOneOriginAddress(move: MoveRecord): string {
  const sortedDays = [...move.jobDays].sort((a, b) => a.date.localeCompare(b.date));
  const dayOne = sortedDays[0];
  if (dayOne?.locations?.length) {
    const origin =
      dayOne.locations.find((loc) => loc.role === "origin") ?? dayOne.locations[0];
    const formatted = formatJobDayLocationAddress(origin);
    if (formatted.trim()) return formatted;
  }
  if (move.intake.origin.street || move.intake.origin.cityStateZip) {
    const street = move.intake.origin.street?.trim();
    const city = move.intake.origin.cityStateZip?.trim();
    if (street && city) return `${street}, ${city}`;
    return street || city || move.originAddress;
  }
  return move.originAddress || "Address on file";
}

export function scheduleWalkthroughOnMove(
  move: MoveRecord,
  draft: WalkthroughScheduleDraft,
  actor?: string,
): MoveRecord {
  const walkthrough: MoveWalkthrough = {
    id: move.scheduledWalkthrough?.id ?? `wt-${move.id}-${Date.now()}`,
    scheduledDate: draft.scheduledDate,
    startTime: draft.startTime,
    assignedTo: draft.assignedTo,
    mode: draft.mode,
    status: "scheduled",
    location:
      draft.mode === "virtual"
        ? "Video call"
        : move.intake.origin.cityStateZip || move.originAddress,
    bookedAt: new Date().toISOString(),
  };

  const modeLabel = draft.mode === "virtual" ? "Virtual" : "On-site";
  const summary = `${modeLabel} walkthrough ${formatMoveDate(draft.scheduledDate)} at ${draft.startTime}`;

  const { move: withPipeline, pipelineActivity } = applyWalkthroughPipelineStage(move);
  const at = new Date().toISOString();
  const activities = [
    {
      id: `act-wt-${Date.now()}`,
      type: "note" as const,
      at,
      summary,
      actor: actor ?? draft.assignedTo,
    },
    ...(pipelineActivity
      ? [
          {
            id: `act-wt-pipeline-${Date.now()}`,
            type: "note" as const,
            at,
            summary: pipelineActivity,
            actor: actor ?? draft.assignedTo,
          },
        ]
      : []),
    ...withPipeline.activities,
  ];

  return {
    ...withPipeline,
    scheduledWalkthrough: walkthrough,
    updatedAt: at,
    activities,
  };
}

function revertWalkthroughPipelineStage(move: MoveRecord): {
  move: MoveRecord;
  pipelineActivity: string | null;
} {
  if (
    move.pipelineStage === "waiting" &&
    move.waitingSubstage === "walkthrough_scheduled"
  ) {
    const next = applyWaitingSubstage(move, "needs_walkthrough");
    return {
      move: next,
      pipelineActivity: `Waiting → ${waitingSubstageLabel("needs_walkthrough")}`,
    };
  }
  return { move, pipelineActivity: null };
}

export function cancelWalkthroughOnMove(
  move: MoveRecord,
  options?: { actor?: string; cancelledBy?: "staff" | "customer" },
): MoveRecord {
  const walkthrough = resolveMoveWalkthrough(move);
  if (!walkthrough || walkthrough.status !== "scheduled") return move;

  const cancelledWalkthrough: MoveWalkthrough = {
    ...(move.scheduledWalkthrough ?? walkthrough),
    status: "cancelled",
  };
  const scheduleLine = formatWalkthroughScheduleLine(walkthrough);
  const cancelledBy = options?.cancelledBy ?? "staff";
  const actor =
    options?.actor ??
    (cancelledBy === "customer" ? move.customerName : undefined);

  const { move: withPipeline, pipelineActivity } = revertWalkthroughPipelineStage(move);
  const at = new Date().toISOString();
  const summary =
    cancelledBy === "customer"
      ? `Walkthrough cancelled by customer — was ${scheduleLine}`
      : `Walkthrough cancelled — was ${scheduleLine}`;

  return {
    ...withPipeline,
    scheduledWalkthrough: cancelledWalkthrough,
    updatedAt: at,
    activities: [
      {
        id: `act-wt-cancel-${Date.now()}`,
        type: "note" as const,
        at,
        summary,
        actor,
      },
      ...(pipelineActivity
        ? [
            {
              id: `act-wt-cancel-pipeline-${Date.now()}`,
              type: "note" as const,
              at,
              summary: pipelineActivity,
              actor,
            },
          ]
        : []),
      ...withPipeline.activities,
    ],
  };
}

function staffIdForRepName(name: string): string {
  const persona = OFFICE_PERSONAS.find((p) => p.name === name || p.assignedRep === name);
  if (persona) return persona.id;
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function walkthroughsToStaffEvents(moves: MoveRecord[]): StaffCalendarEvent[] {
  const events: StaffCalendarEvent[] = [];
  for (const move of moves) {
    const wt = resolveMoveWalkthrough(move);
    if (!wt || wt.status !== "scheduled") continue;

    const startMinutes = parseTimeToMinutes(wt.startTime);
    events.push({
      id: `wt-ev-${wt.id}`,
      title: `Walkthrough — ${move.customerName}`,
      dateKey: wt.scheduledDate,
      startMinutes,
      endMinutes: startMinutes + SLOT_DURATION_MIN,
      staffId: staffIdForRepName(wt.assignedTo),
      staffName: wt.assignedTo,
      department: "sales",
      kind: wt.mode === "virtual" ? "walkthrough_virtual" : "walkthrough_in_person",
      location: wt.location,
      outlookSynced: false,
      source: "walkthrough",
      moveId: move.id,
    });
  }
  return events;
}
