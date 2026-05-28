import type { HistoryQuickActionId } from "./quick-actions";
import type { MoveActivity, MoveActivityType, MoveRecord } from "./types";

export type CommunicationHistoryItem = {
  id: string;
  at: string;
  summary: string;
  actor?: string;
  source: "activity" | "follow_up" | "demo";
};

export type { HistoryQuickActionId };

const ACTION_ACTIVITY_TYPES: Partial<Record<HistoryQuickActionId, MoveActivityType[]>> = {
  call: ["call"],
  email: ["email"],
  note: ["note"],
  sms: [],
  "follow-up": ["follow_up"],
};

function matchesSmsActivity(activity: MoveActivity): boolean {
  const text = activity.summary.toLowerCase();
  return (
    text.includes("sms") ||
    text.includes("text message") ||
    text.includes("texted") ||
    text.includes("text ")
  );
}

function matchesEmailActivity(activity: MoveActivity): boolean {
  if (activity.type === "email") return true;
  if (activity.type !== "document") return false;
  const text = activity.summary.toLowerCase();
  return (
    text.includes("proposal") ||
    text.includes("estimate") ||
    text.includes("contract") ||
    text.includes("email")
  );
}

function supplementalHistory(
  move: MoveRecord,
  action: HistoryQuickActionId,
): CommunicationHistoryItem[] {
  const extras: CommunicationHistoryItem[] = [];

  if (move.pipelineStage === "quote_sent" || move.pipelineStage === "booked") {
    if (action === "email") {
      extras.push({
        id: `demo-email-view-${move.id}`,
        at: move.updatedAt,
        summary: "Client viewed estimate link",
        actor: "System",
        source: "demo",
      });
    }
  }

  if (move.pipelineStage === "quote_sent" && action === "sms") {
    extras.push({
      id: `demo-sms-reminder-${move.id}`,
      at: move.updatedAt,
      summary: "Automated quote follow-up SMS queued",
      actor: "System",
      source: "demo",
    });
  }

  if (move.pipelineStage === "booked" && action === "sms") {
    extras.push({
      id: `demo-sms-dayof-${move.id}`,
      at: move.updatedAt,
      summary: "Day-of reminder SMS sent",
      actor: move.assignedRep,
      source: "demo",
    });
  }

  return extras;
}

/** Prior communication for a quick-action channel, newest first. */
export function getCommunicationHistory(
  move: MoveRecord,
  action: HistoryQuickActionId,
): CommunicationHistoryItem[] {
  const types = ACTION_ACTIVITY_TYPES[action] ?? [];

  const fromActivities: CommunicationHistoryItem[] = move.activities
    .filter((a) => {
      if (types.includes(a.type)) return true;
      if (action === "sms") return matchesSmsActivity(a);
      if (action === "email") return matchesEmailActivity(a);
      return false;
    })
    .map((a) => ({
      id: a.id,
      at: a.at,
      summary: a.summary,
      actor: a.actor,
      source: "activity" as const,
    }));

  const fromFollowUps: CommunicationHistoryItem[] =
    action === "sms"
      ? move.followUps
          .filter((f) => f.channel === "sms")
          .map((f) => ({
            id: `follow-up-${f.id}`,
            at: f.dueAt,
            summary: f.title,
            actor: f.assignedTo,
            source: "follow_up" as const,
          }))
      : action === "call"
        ? move.followUps
            .filter((f) => f.channel === "call")
            .map((f) => ({
              id: `follow-up-${f.id}`,
              at: f.dueAt,
              summary: f.title,
              actor: f.assignedTo,
              source: "follow_up" as const,
            }))
        : action === "email"
          ? move.followUps
              .filter((f) => f.channel === "email")
              .map((f) => ({
                id: `follow-up-${f.id}`,
                at: f.dueAt,
                summary: f.title,
                actor: f.assignedTo,
                source: "follow_up" as const,
              }))
          : [];

  const items = [...fromActivities, ...fromFollowUps, ...supplementalHistory(move, action)];

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function communicationHistoryLabel(action: HistoryQuickActionId): string {
  switch (action) {
    case "call":
      return "Call history";
    case "sms":
      return "Messages";
    case "email":
      return "Email history";
    case "note":
      return "Notes";
    case "follow-up":
      return "Follow-ups";
  }
}
