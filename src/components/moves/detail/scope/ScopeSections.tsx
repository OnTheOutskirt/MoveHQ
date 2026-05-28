"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import { InlineField } from "@/components/moves/detail/inline/InlineField";
import { InlineMultiSelect } from "@/components/moves/detail/inline/InlineMultiSelect";
import { MoveDetailLocationsTab } from "@/components/moves/detail/MoveDetailLocationsTab";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import type { IntakeJobType, PackingDensity, PackingService } from "@/lib/moves/flat-rate-intake";
import {
  intakeHearAboutLabel,
  intakeJobTypeLabel,
  packingDensityLabel,
  packingServiceLabel,
} from "@/lib/moves/intake-display";
import {
  applySelectedServices,
  deriveSelectedServices,
  INTAKE_SERVICE_OPTIONS,
  type IntakeServiceId,
} from "@/lib/moves/intake-services";
import {
  hearAboutOptions,
  jobTypeOptions,
  loadUnloadDirectionOptions,
  packingDensityOptions,
  packingServiceOptions,
  parseYesNo,
  yesNoOptions,
  yesNoValue,
} from "@/lib/moves/intake-field-options";
import { SCOPE_SECTION_IDS } from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus, Trash2 } from "lucide-react";

const PARTIAL_ROOM_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  "china-cabinet": "China cabinet",
  curio: "Curio cabinet",
  buffet: "Buffet",
  "dry-bar": "Dry bar / bar cart",
  collectibles: "Collectibles / display shelves",
  "decor-some": "Décor & wall art — some",
  "decor-heavy": "Décor & wall art — heavy",
  "primary-bath": "Primary bathroom",
  bedrooms: "Bedrooms / closets",
  office: "Office / books",
  garage: "Garage",
};

const FLOOR_LABELS: Record<number, string> = {
  1: "First floor",
  2: "Second floor",
  3: "Third floor",
};

const APPLIANCE_HANDLING_OPTIONS = [
  { value: "", label: "—" },
  { value: "client", label: "Client will handle" },
  { value: "referral", label: "Needs third-party referral" },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ScopeMoveDetailsSection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patch } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  const selectedServices = deriveSelectedServices(intake);

  const boxCountValue =
    intake.customBoxCount != null
      ? String(intake.customBoxCount)
      : intake.estimatedBoxCount != null
        ? String(intake.estimatedBoxCount)
        : "";

  const boxCountLabel =
    intake.customBoxCount != null
      ? `${intake.customBoxCount} boxes (client provided)`
      : intake.estimatedBoxCount != null
        ? `~${intake.estimatedBoxCount} boxes (estimated)`
        : "—";

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.moveDetails}>
      <DetailSection title="Move Details">
        <DetailFieldGrid cols={3}>
          <InlineField
            label="Target move date"
            type="date"
            value={intake.moveDate}
            displayValue={formatMoveDate(intake.moveDate)}
            onSave={(v) => patch({ moveDate: v })}
            disabled={disabled}
          />
          <InlineField
            label="How did you hear about us?"
            type="select"
            options={hearAboutOptions}
            value={intake.hearAboutUs}
            displayValue={intakeHearAboutLabel(intake.hearAboutUs)}
            onSave={(v) => patch({ hearAboutUs: v as typeof intake.hearAboutUs })}
            disabled={disabled}
          />
          <DetailField
            label="Intake submitted"
            value={
              intake.submittedAt
                ? formatMoveDate(intake.submittedAt.slice(0, 10))
                : "—"
            }
          />
          <InlineField
            label="Job type"
            type="select"
            options={jobTypeOptions}
            value={intake.jobType}
            displayValue={intakeJobTypeLabel(intake.jobType)}
            onSave={(v) => patch({ jobType: v as IntakeJobType })}
            disabled={disabled}
          />
          <InlineMultiSelect
            label="Services needed"
            values={selectedServices}
            options={INTAKE_SERVICE_OPTIONS}
            onSave={(ids) => patch(applySelectedServices(ids as IntakeServiceId[]))}
            disabled={disabled}
            fullWidth
            placeholder="Click to select services…"
            bubbles
          />
          <InlineField
            label="Junk removal"
            type="select"
            options={yesNoOptions}
            value={yesNoValue(intake.hasJunk)}
            onSave={(v) => patch({ hasJunk: parseYesNo(v) })}
            disabled={disabled}
          />
          <InlineField
            label="Packing service"
            type="select"
            options={packingServiceOptions}
            value={intake.packingService}
            displayValue={packingServiceLabel(intake.packingService)}
            onSave={(v) => patch({ packingService: v as PackingService })}
            disabled={disabled}
          />
          <InlineField
            label="Belongings density"
            type="select"
            options={packingDensityOptions}
            value={intake.packingDensity}
            displayValue={packingDensityLabel(intake.packingDensity)}
            onSave={(v) => patch({ packingDensity: v as PackingDensity | "" })}
            disabled={disabled}
          />
          <InlineField
            label="Boxes / totes on truck"
            type="number"
            value={boxCountValue}
            displayValue={boxCountLabel}
            onSave={(v) => {
              const n = v ? Number(v) : null;
              if (intake.customBoxCount != null) {
                patch({ customBoxCount: n });
              } else {
                patch({ estimatedBoxCount: n });
              }
            }}
            disabled={disabled}
          />
          {intake.jobType === "load-unload-only" ? (
            <>
              <InlineField
                label="Direction"
                type="select"
                options={loadUnloadDirectionOptions}
                value={intake.loadUnloadDirection ?? ""}
                displayValue={
                  intake.loadUnloadDirection === "loading"
                    ? "Loading"
                    : intake.loadUnloadDirection === "unloading"
                      ? "Unloading"
                      : "—"
                }
                onSave={(v) =>
                  patch({
                    loadUnloadDirection: v as "loading" | "unloading" | "",
                  })
                }
                disabled={disabled}
              />
              <InlineField
                label="Container"
                value={intake.containerType ?? ""}
                onSave={(v) => patch({ containerType: v })}
                disabled={disabled}
              />
            </>
          ) : null}
          {intake.packingService === "partial" && intake.partialPackRooms.length > 0 ? (
            <DetailField
              label="Areas to pack"
              value={intake.partialPackRooms
                .map((r) => PARTIAL_ROOM_LABELS[r] ?? r)
                .join(", ")}
              fullWidth
            />
          ) : null}
          {intake.packingService === "partial" ? (
            <InlineField
              label="Other areas"
              value={intake.partialPackOther ?? ""}
              onSave={(v) => patch({ partialPackOther: v })}
              disabled={disabled}
              fullWidth
            />
          ) : null}
          {intake.packingService === "full" || intake.packingService === "partial" ? (
            <InlineField
              label="Box estimate acknowledged"
              type="select"
              options={yesNoOptions}
              value={yesNoValue(intake.boxApprovalAcknowledged)}
              onSave={(v) => patch({ boxApprovalAcknowledged: parseYesNo(v) })}
              disabled={disabled}
            />
          ) : null}
        </DetailFieldGrid>

        {intake.jobType === "in-facility" ? (
          <p className="mt-3 text-xs text-amber-800">
            In-facility move — single address; destination hidden on intake.
          </p>
        ) : null}
        {intake.jobType === "in-home-rearrange" ? (
          <p className="mt-3 text-xs text-amber-800">
            In-home rearrange — origin and destination are the same home.
          </p>
        ) : null}
        {intake.packingService === "self-move" ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Furniture-only job — client moves own boxes.
          </p>
        ) : null}

        {intake.hasJunk ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Haul-off details
            </p>
            <DetailFieldGrid cols={3}>
              <InlineField
                label="Volume"
                value={intake.junkVolume ?? ""}
                onSave={(v) => patch({ junkVolume: v })}
                disabled={disabled}
              />
              <InlineField
                label="Items"
                type="textarea"
                value={intake.junkItems ?? ""}
                onSave={(v) => patch({ junkItems: v })}
                disabled={disabled}
                fullWidth
              />
            </DetailFieldGrid>
          </div>
        ) : null}
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeLocationsSection({ move }: { move: MoveRecord }) {
  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.locations}>
      <DetailSection title="Locations & Access">
        <MoveDetailLocationsTab move={move} />
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeInventorySection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patchFn, patchRoom } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  const floors = [1, 2, 3] as const;
  const roomsByFloor = floors.map((f) => ({
    floor: f,
    rooms: intake.rooms.filter((r) => r.floor === f),
  }));

  function addRoom() {
    patchFn((prev) => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        { id: newId("room"), floor: 1, name: "New room", items: "" },
      ],
    }));
  }

  function removeRoom(roomId: string) {
    patchFn((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
    }));
  }

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.inventory}>
      <DetailSection
        title="Inventory"
        description="Room-by-room list from intake or walkthrough."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {intake.rooms.length} room{intake.rooms.length === 1 ? "" : "s"}
          </p>
          {!disabled ? (
            <Button type="button" size="sm" variant="secondary" onClick={addRoom}>
              <Plus className="h-3.5 w-3.5" />
              Add room
            </Button>
          ) : null}
        </div>

        {intake.rooms.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No rooms yet.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {roomsByFloor.map(
              ({ floor, rooms }) =>
                rooms.length > 0 && (
                  <div key={floor}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {FLOOR_LABELS[floor]}
                    </p>
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                      {rooms.map((room) => (
                        <div key={room.id} className="group p-3">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1 space-y-2">
                              <InlineField
                                label="Room"
                                value={room.name}
                                onSave={(v) => patchRoom(room.id, { name: v })}
                                disabled={disabled}
                                fullWidth
                              />
                              <InlineField
                                label="Items"
                                type="textarea"
                                value={room.items}
                                displayValue={room.items || "Add items…"}
                                onSave={(v) => patchRoom(room.id, { items: v })}
                                disabled={disabled}
                                fullWidth
                                placeholder="List furniture and items…"
                              />
                            </div>
                            {!disabled ? (
                              <button
                                type="button"
                                onClick={() => removeRoom(room.id)}
                                className="mt-5 rounded p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                aria-label="Remove room"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeAppliancesSection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patch, patchFn } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  function addAppliance() {
    patchFn((prev) => ({
      ...prev,
      appliances: [
        ...prev.appliances,
        { id: newId("appliance"), label: "New appliance", quantity: 1 },
      ],
    }));
  }

  function updateAppliance(
    id: string,
    partial: { label?: string; quantity?: number },
  ) {
    patchFn((prev) => ({
      ...prev,
      appliances: prev.appliances.map((a) => (a.id === id ? { ...a, ...partial } : a)),
    }));
  }

  function removeAppliance(id: string) {
    patchFn((prev) => ({
      ...prev,
      appliances: prev.appliances.filter((a) => a.id !== id),
    }));
  }

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.appliances}>
      <DetailSection title="Appliances">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {intake.appliances.length === 0
              ? "None listed"
              : `${intake.appliances.length} appliance${intake.appliances.length === 1 ? "" : "s"}`}
          </p>
          {!disabled ? (
            <Button type="button" size="sm" variant="secondary" onClick={addAppliance}>
              <Plus className="h-3.5 w-3.5" />
              Add appliance
            </Button>
          ) : null}
        </div>

        {intake.appliances.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {intake.appliances.map((a) => (
              <li key={a.id} className="group flex items-start gap-2 p-3">
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_5rem]">
                  <InlineField
                    label="Appliance"
                    value={a.label}
                    onSave={(v) => updateAppliance(a.id, { label: v })}
                    disabled={disabled}
                    fullWidth
                  />
                  <InlineField
                    label="Qty"
                    type="number"
                    value={String(a.quantity)}
                    onSave={(v) =>
                      updateAppliance(a.id, { quantity: v ? Math.max(1, Number(v)) : 1 })
                    }
                    disabled={disabled}
                  />
                </div>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeAppliance(a.id)}
                    className="mt-5 rounded p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Remove appliance"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <DetailFieldGrid cols={3}>
            <InlineField
              label="Disconnect / reconnect"
              type="select"
              options={APPLIANCE_HANDLING_OPTIONS}
              value={intake.applianceDisconnectHandling ?? ""}
              displayValue={
                intake.applianceDisconnectHandling === "client"
                  ? "Client will handle"
                  : intake.applianceDisconnectHandling === "referral"
                    ? "Needs third-party referral"
                    : "—"
              }
              onSave={(v) =>
                patch({
                  applianceDisconnectHandling: v as "client" | "referral" | "",
                })
              }
              disabled={disabled}
              fullWidth
            />
          </DetailFieldGrid>
        </div>
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeWardrobeSection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patch } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.wardrobe}>
      <DetailSection title="Wardrobe boxes">
        <DetailFieldGrid cols={3}>
          <InlineField
            label="Jonah's wardrobe boxes"
            type="number"
            value={String(intake.wardrobe.jonahCount || "")}
            displayValue={
              intake.wardrobe.jonahCount > 0
                ? `${intake.wardrobe.jonahCount} (${
                    intake.wardrobe.jonahType === "keep" ? "$20" : "$10"
                  } each)`
                : "None"
            }
            onSave={(v) =>
              patch({
                wardrobe: {
                  ...intake.wardrobe,
                  jonahCount: v ? Number(v) : 0,
                },
              })
            }
            disabled={disabled}
          />
          <InlineField
            label="Client-owned wardrobes"
            type="number"
            value={String(intake.wardrobe.clientOwnedCount || "")}
            displayValue={
              intake.wardrobe.clientOwnedCount > 0
                ? `${intake.wardrobe.clientOwnedCount} (16 cu ft each)`
                : "None"
            }
            onSave={(v) =>
              patch({
                wardrobe: {
                  ...intake.wardrobe,
                  clientOwnedCount: v ? Number(v) : 0,
                },
              })
            }
            disabled={disabled}
          />
        </DetailFieldGrid>
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeSpecialtySection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patch } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  return (
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.specialty}>
      <DetailSection title="Specialty & high-value">
        <DetailFieldGrid cols={3}>
          <InlineField
            label="Specialty items"
            type="select"
            options={yesNoOptions}
            value={yesNoValue(intake.hasSpecialtyItems)}
            displayValue={intake.hasSpecialtyItems ? "Yes — manual review" : "No"}
            onSave={(v) => patch({ hasSpecialtyItems: parseYesNo(v) })}
            disabled={disabled}
          />
          <InlineField
            label="High-value items"
            type="select"
            options={yesNoOptions}
            value={yesNoValue(intake.hasHighValueItems)}
            onSave={(v) => patch({ hasHighValueItems: parseYesNo(v) })}
            disabled={disabled}
          />
          <InlineField
            label="Timing complexity"
            type="select"
            options={yesNoOptions}
            value={yesNoValue(intake.hasTimingComplexity)}
            onSave={(v) => patch({ hasTimingComplexity: parseYesNo(v) })}
            disabled={disabled}
          />
          <InlineField
            label="Specialty notes"
            type="textarea"
            value={intake.specialtyNotes ?? ""}
            onSave={(v) => patch({ specialtyNotes: v })}
            disabled={disabled}
            fullWidth
          />
          <InlineField
            label="Timing notes"
            type="textarea"
            value={intake.timingNotes ?? ""}
            onSave={(v) => patch({ timingNotes: v })}
            disabled={disabled}
            fullWidth
          />
          <InlineField
            label="Additional notes"
            type="textarea"
            value={intake.additionalNotes ?? ""}
            onSave={(v) => patch({ additionalNotes: v })}
            disabled={disabled}
            fullWidth
          />
        </DetailFieldGrid>
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}
