import {
  getCommunicationHistory,
  type CommunicationHistoryItem,
} from "@/lib/moves/communication-history";
import type { HistoryQuickActionId } from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";

export type DirectoryContactChannel = Extract<HistoryQuickActionId, "call" | "sms" | "email">;

export const DIRECTORY_CONTACT_CHANNELS: DirectoryContactChannel[] = ["call", "sms", "email"];

export type DirectoryCommunicationItem = CommunicationHistoryItem & {
  channel: DirectoryContactChannel;
  moveReference?: string;
};

function linkedMoves(moves: MoveRecord[], moveIds: string[]): MoveRecord[] {
  const ids = new Set(moveIds);
  return moves.filter((m) => ids.has(m.id));
}

/** Prior communication for a contact channel across linked moves, newest first. */
export function getPersonCommunicationHistory(
  moves: MoveRecord[],
  moveIds: string[],
  action: DirectoryContactChannel,
): CommunicationHistoryItem[] {
  const items: CommunicationHistoryItem[] = [];

  for (const move of linkedMoves(moves, moveIds)) {
    for (const item of getCommunicationHistory(move, action)) {
      items.push({
        ...item,
        id: `${move.id}-${item.id}`,
        summary:
          moveIds.length > 1 ? `${move.reference} · ${item.summary}` : item.summary,
      });
    }
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

/** All call, SMS, and email history for a contact. */
export function getPersonAllCommunicationHistory(
  moves: MoveRecord[],
  moveIds: string[],
): DirectoryCommunicationItem[] {
  const items: DirectoryCommunicationItem[] = [];

  for (const channel of DIRECTORY_CONTACT_CHANNELS) {
    for (const move of linkedMoves(moves, moveIds)) {
      for (const item of getCommunicationHistory(move, channel)) {
        items.push({
          ...item,
          id: `${move.id}-${channel}-${item.id}`,
          channel,
          moveReference: move.reference,
          summary:
            moveIds.length > 1 ? `${move.reference} · ${item.summary}` : item.summary,
        });
      }
    }
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export const DIRECTORY_CHANNEL_LABELS: Record<DirectoryContactChannel, string> = {
  call: "Call",
  sms: "SMS",
  email: "Email",
};
