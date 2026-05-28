import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveActivity, MoveRecord } from "@/lib/moves/types";
import type { InboxChannel, InboxFilter, InboxMessage, InboxThread } from "./types";

function activityToChannel(activity: MoveActivity): InboxChannel | null {
  if (activity.type === "call") return "call";
  if (activity.type === "email") return "email";
  const text = activity.summary.toLowerCase();
  if (
    activity.type === "note" &&
    (text.includes("sms") || text.includes("text"))
  ) {
    return "sms";
  }
  if (text.includes("sms") || text.includes("text message") || text.includes("texted")) {
    return "sms";
  }
  if (text.includes("email") || text.includes("proposal") || text.includes("estimate")) {
    return "email";
  }
  return null;
}

function activityDirection(activity: MoveActivity): InboxMessage["direction"] {
  if (activity.actor === "System" || activity.actor === "Customer") return "inbound";
  return "outbound";
}

function messagesFromMove(move: MoveRecord): InboxMessage[] {
  const fromActivities: InboxMessage[] = [];

  for (const a of move.activities) {
    const channel = activityToChannel(a);
    if (!channel) continue;
    fromActivities.push({
      id: `act-${a.id}`,
      channel,
      direction: activityDirection(a),
      body: a.summary,
      at: a.at,
      actor: a.actor,
      read: activityDirection(a) === "outbound",
    });
  }

  return fromActivities.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function supplementalMessages(move: MoveRecord): InboxMessage[] {
  const extras: InboxMessage[] = [];

  if (move.id === "mv-new-lead") {
    extras.push({
      id: `inb-${move.id}-sms1`,
      channel: "sms",
      direction: "inbound",
      body: "Hi — I started a quote online but had to run. Can someone call me about packing?",
      at: "2026-05-20T09:14:00Z",
      actor: "Customer",
      read: false,
    });
  }

  if (move.id === "mv-quote-sent") {
    extras.push(
      {
        id: `inb-${move.id}-email1`,
        channel: "email",
        direction: "inbound",
        body: "Re: Your estimate — can you adjust for a piano? We might book next week.",
        at: "2026-05-20T11:02:00Z",
        actor: "Customer",
        read: false,
      },
      {
        id: `inb-${move.id}-sms1`,
        channel: "sms",
        direction: "outbound",
        body: "Thanks! I'll update the quote and email you shortly.",
        at: "2026-05-20T11:18:00Z",
        actor: move.assignedRep,
        read: true,
      },
    );
  }

  if (move.id === "mv-waiting-info") {
    extras.push({
      id: `inb-${move.id}-call1`,
      channel: "call",
      direction: "inbound",
      body: "Missed call — office manager asked for callback before 3pm.",
      at: "2026-05-20T08:40:00Z",
      actor: "Customer",
      read: false,
    });
  }

  if (move.id === "mv-web-quoted") {
    extras.push({
      id: `inb-${move.id}-email1`,
      channel: "email",
      direction: "inbound",
      body: "Got the AI quote — comparing with another mover. Any wiggle room on price?",
      at: "2026-05-19T16:45:00Z",
      actor: "Customer",
      read: false,
    });
  }

  if (move.id === "mv-booked") {
    extras.push({
      id: `inb-${move.id}-sms1`,
      channel: "sms",
      direction: "inbound",
      body: "What time should we expect the crew? Need to reserve the elevator.",
      at: "2026-05-20T07:55:00Z",
      actor: "Customer",
      read: false,
    });
  }

  return extras;
}

function computeNeedsReply(messages: InboxMessage[]): boolean {
  const sorted = [...messages].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const lastInbound = sorted.find((m) => m.direction === "inbound");
  if (!lastInbound) return false;
  const hasReplyAfter = sorted.some(
    (m) =>
      m.direction === "outbound" && new Date(m.at).getTime() > new Date(lastInbound.at).getTime(),
  );
  return !hasReplyAfter;
}

function finalizeThread(move: MoveRecord, messages: InboxMessage[]): InboxThread | null {
  if (messages.length === 0) return null;

  const sorted = [...messages].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const last = sorted[0]!;
  const unreadCount = messages.filter((m) => !m.read).length;

  return {
    id: `thread-${move.id}`,
    moveId: move.id,
    customerName: move.customerName,
    moveReference: move.reference,
    assignedRep: move.assignedRep,
    customerPhone: move.customerPhone,
    customerEmail: move.customerEmail,
    messages: [...messages].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    unreadCount,
    needsReply: computeNeedsReply(messages),
    lastChannel: last.channel,
    lastPreview: last.body,
    lastAt: last.at,
  };
}

export function buildInboxThreadsFromMoves(moves: MoveRecord[]): InboxThread[] {
  const threads: InboxThread[] = [];

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    const messages = [...messagesFromMove(move), ...supplementalMessages(move)];
    const thread = finalizeThread(move, messages);
    if (thread) threads.push(thread);
  }

  return threads.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
}

export function threadMatchesFilter(thread: InboxThread, filter: InboxFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return thread.unreadCount > 0;
    case "needs_reply":
      return thread.needsReply;
    case "call":
    case "sms":
    case "email":
      return thread.messages.some((m) => m.channel === filter);
  }
}
