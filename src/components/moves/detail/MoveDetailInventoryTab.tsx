"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailInventoryTabProps = {
  move: MoveRecord;
};

const FLOOR_LABELS: Record<number, string> = {
  1: "First floor",
  2: "Second floor",
  3: "Third floor",
};

export function MoveDetailInventoryTab({ move }: MoveDetailInventoryTabProps) {
  const { intake } = move;
  const floors = [1, 2, 3] as const;
  const roomsByFloor = floors.map((f) => ({
    floor: f,
    rooms: intake.rooms.filter((r) => r.floor === f),
  }));

  const wardrobeTotal =
    intake.wardrobe.jonahCount > 0
      ? `${intake.wardrobe.jonahCount} from Jonah's (${
          intake.wardrobe.jonahType === "keep" ? "$20" : "$10"
        } each)`
      : null;

  return (
    <div className="space-y-4">
      <DetailSection
        title="Boxes & packing summary"
        description="From Stage 1 selections — change intake to update"
      >
        <DetailFieldGrid>
          <DetailField
            label="Boxes / totes to move"
            value={
              intake.estimatedBoxCount != null
                ? `~${intake.estimatedBoxCount} estimated`
                : "—"
            }
          />
          <DetailField label="Packing service" value={intake.packingService} />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Room-by-room inventory">
        {intake.rooms.length === 0 ? (
          <p className="text-sm text-slate-500">No rooms listed on intake.</p>
        ) : (
          <div className="space-y-4">
            {roomsByFloor.map(
              ({ floor, rooms }) =>
                rooms.length > 0 && (
                  <div key={floor}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {FLOOR_LABELS[floor]} ({rooms.length} room{rooms.length === 1 ? "" : "s"})
                    </p>
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="rounded-md border border-slate-200 bg-slate-50/80 p-3"
                        >
                          <p className="text-sm font-medium text-slate-900">{room.name}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            {room.items || "(no items listed)"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Appliances">
        {intake.appliances.length === 0 ? (
          <p className="text-sm text-slate-500">None selected</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-900">
            {intake.appliances.map((a) => (
              <li key={a.id}>
                {a.label}
                {a.quantity > 1 ? ` ×${a.quantity}` : ""}
              </li>
            ))}
          </ul>
        )}
        <DetailFieldGrid>
          <DetailField
            label="Disconnect / reconnect"
            value={
              intake.applianceDisconnectHandling === "client"
                ? "Client will handle"
                : intake.applianceDisconnectHandling === "referral"
                  ? "Needs third-party referral"
                  : "—"
            }
            fullWidth
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Wardrobe boxes">
        <DetailFieldGrid>
          <DetailField label="Jonah's wardrobe boxes" value={wardrobeTotal ?? "None"} />
          <DetailField
            label="Client-owned wardrobes"
            value={
              intake.wardrobe.clientOwnedCount > 0
                ? `${intake.wardrobe.clientOwnedCount} (16 cu ft each, no charge)`
                : "None"
            }
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Items to haul off">
        {intake.hasJunk ? (
          <DetailFieldGrid>
            <DetailField label="Volume" value={intake.junkVolume ?? "—"} />
            <DetailField
              label="Items"
              value={
                <span className="whitespace-pre-wrap font-normal">{intake.junkItems ?? "—"}</span>
              }
              fullWidth
            />
          </DetailFieldGrid>
        ) : (
          <p className="text-sm text-slate-500">No haul-off items</p>
        )}
      </DetailSection>
    </div>
  );
}
