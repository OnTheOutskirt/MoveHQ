import type { MoveRecord } from "@/lib/moves/types";
import {
  packingDensityLabel,
  packingServiceLabel,
} from "@/lib/moves/intake-display";
import { equipmentSuppliesDocumentNotes } from "@/lib/moves/equipment-supplies";

export type DocumentMoveRoom = {
  name: string;
  floor: 1 | 2 | 3;
  items: string;
};

export type DocumentMoveContents = {
  homeSizeLabel: string;
  packingDensity: string;
  packingService: string;
  estimatedBoxCount: number | null;
  rooms: DocumentMoveRoom[];
  appliances: { label: string; quantity: number }[];
  notes: string[];
};

const SAMPLE_CONTENTS: DocumentMoveContents = {
  homeSizeLabel: "3BR / 2,000–2,400 sq ft",
  packingDensity: "Average packing",
  packingService: "Partial pack (selected rooms)",
  estimatedBoxCount: 70,
  rooms: [
    { floor: 1, name: "Living Room", items: "Sectional, 65\" TV, bookshelf, side tables" },
    { floor: 1, name: "Kitchen", items: "Dining table, china cabinet contents, bar stools" },
    { floor: 2, name: "Master Bedroom", items: "King bed, dresser, nightstands" },
    { floor: 2, name: "Bedroom 2", items: "Queen bed, desk, dresser" },
    { floor: 2, name: "Basement", items: "Storage shelves, holiday bins, exercise bike" },
  ],
  appliances: [
    { label: "Kitchen fridge", quantity: 1 },
    { label: "Washer / dryer", quantity: 1 },
  ],
  notes: ["Partial pack: kitchen, china cabinet", "2 TV boxes · safe dolly"],
};

export function sampleDocumentMoveContents(): DocumentMoveContents {
  return SAMPLE_CONTENTS;
}

export function buildDocumentMoveContents(move: MoveRecord): DocumentMoveContents {
  const { intake } = move;
  const notes: string[] = [];

  if (intake.packingService === "partial") {
    const rooms = intake.partialPackRooms.join(", ");
    notes.push(
      rooms
        ? `Partial pack: ${rooms}${intake.partialPackOther ? ` · ${intake.partialPackOther}` : ""}`
        : "Partial pack service",
    );
  } else if (intake.packingService === "full") {
    notes.push("Full packing service");
  }

  if (intake.hasSpecialtyItems) {
    notes.push(intake.specialtyNotes?.trim() || "Specialty items flagged");
  }
  if (intake.hasJunk) {
    notes.push(intake.junkItems?.trim() || "Junk / haul-away");
  }

  const equipmentNotes = equipmentSuppliesDocumentNotes(intake, move);
  if (equipmentNotes.length > 0) {
    notes.push(...equipmentNotes);
  } else {
    if (intake.extras.tvBoxCount > 0) {
      notes.push(`${intake.extras.tvBoxCount} TV box${intake.extras.tvBoxCount === 1 ? "" : "es"}`);
    }
    if (intake.extras.safeDolly) {
      notes.push("Safe dolly");
    }
    for (const extra of intake.extras.other) {
      if (extra.quantity > 0) {
        notes.push(`${extra.label} (${extra.quantity})`);
      }
    }
    if (intake.wardrobe.jonahCount > 0) {
      notes.push(`${intake.wardrobe.jonahCount} wardrobe box(es)`);
    }
  }

  return {
    homeSizeLabel: intake.homeSizeLabel || "—",
    packingDensity: intake.packingDensity ? packingDensityLabel(intake.packingDensity) : "",
    packingService: intake.packingService ? packingServiceLabel(intake.packingService) : "",
    estimatedBoxCount: intake.estimatedBoxCount,
    rooms: intake.rooms.map((r) => ({
      name: r.name,
      floor: r.floor,
      items: r.items.trim(),
    })),
    appliances: intake.appliances
      .filter((a) => a.quantity > 0)
      .map((a) => ({ label: a.label, quantity: a.quantity })),
    notes,
  };
}

export function parseMoveContentsFromVars(vars: Record<string, string>): DocumentMoveContents | null {
  try {
    const raw = JSON.parse(vars.move_contents_json || "null") as unknown;
    if (!raw || typeof raw !== "object") return null;
    return raw as DocumentMoveContents;
  } catch {
    return null;
  }
}

export function serializeMoveContents(contents: DocumentMoveContents): string {
  return JSON.stringify(contents);
}

export function contentsSummaryLine(contents: DocumentMoveContents): string {
  const parts = [contents.homeSizeLabel];
  if (contents.rooms.length > 0) {
    parts.push(`${contents.rooms.length} room${contents.rooms.length === 1 ? "" : "s"}`);
  }
  if (contents.appliances.length > 0) {
    const count = contents.appliances.reduce((s, a) => s + a.quantity, 0);
    parts.push(`${count} appliance${count === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

export function truncateItems(text: string, max = 96): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
