import type { MoveRecord } from "./types";

export type MoveMediaItem = {
  id: string;
  type: "snapshot" | "video";
  label: string;
  capturedAt: string;
  /** LiveSwitch media URL — populated when integration is wired. */
  mediaUrl?: string;
};

const DEMO_MEDIA: Record<string, MoveMediaItem[]> = {
  "mv-booked": [
    {
      id: "media-1",
      type: "snapshot",
      label: "Living room — pre-move",
      capturedAt: "2026-05-14T09:12:00Z",
    },
    {
      id: "media-2",
      type: "video",
      label: "Walk-through clip",
      capturedAt: "2026-05-14T09:18:00Z",
    },
    {
      id: "media-3",
      type: "snapshot",
      label: "Garage inventory",
      capturedAt: "2026-05-14T09:22:00Z",
    },
  ],
};

/** Media from LiveSwitch — demo items for select moves; empty elsewhere. */
export function getMoveMediaItems(move: MoveRecord): MoveMediaItem[] {
  return DEMO_MEDIA[move.id] ?? [];
}

export function formatMediaCapturedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
