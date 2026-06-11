import type { MoveActivity, MoveRecord } from "./types";

export type ActivityFeedItem = {
  id: string;
  at: string;
  title: string;
  detail?: string;
  kind: "activity" | "demo";
  activityType?: MoveActivity["type"];
  document?: MoveActivity["document"];
};

function hasDocumentEvent(
  move: MoveRecord,
  event: NonNullable<MoveActivity["document"]>["event"],
): boolean {
  return move.activities.some((a) => a.document?.event === event);
}

function demoFeedItems(move: MoveRecord): ActivityFeedItem[] {
  const extras: ActivityFeedItem[] = [];
  const hasViewed = hasDocumentEvent(move, "viewed");
  const hasDeposit = hasDocumentEvent(move, "deposit_paid");

  if (
    !hasViewed &&
    (move.pipelineStage === "quote_sent" || move.pipelineStage === "booked")
  ) {
    extras.push({
      id: `demo-view-${move.id}`,
      at: move.updatedAt,
      title: "Client viewed estimate",
      detail: "Link opened · 2 min read",
      kind: "demo",
    });
  }
  if (!hasDeposit && move.pipelineStage === "booked") {
    extras.push({
      id: `demo-deposit-${move.id}`,
      at: move.createdAt,
      title: "Deposit paid",
      detail: "$500 via card",
      kind: "demo",
    });
  }
  return extras;
}

export function buildMoveActivityFeed(move: MoveRecord): ActivityFeedItem[] {
  const activityItems: ActivityFeedItem[] = move.activities.map((a) => ({
    id: a.id,
    at: a.at,
    title: a.summary,
    detail: a.actor,
    kind: "activity" as const,
    activityType: a.type,
    document: a.document,
  }));

  return [...activityItems, ...demoFeedItems(move)].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export const RECENT_ACTIVITY_SIDEBAR_LIMIT = 3;
