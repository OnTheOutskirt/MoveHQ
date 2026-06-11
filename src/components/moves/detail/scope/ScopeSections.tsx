"use client";

import { DetailFieldGrid, DetailSection } from "@/components/moves/detail/DetailSection";
import { InlineField } from "@/components/moves/detail/inline/InlineField";
import { InlineMultiSelect } from "@/components/moves/detail/inline/InlineMultiSelect";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { Button } from "@/components/ui/Button";
import type { PackingDensity, PackingService } from "@/lib/moves/flat-rate-intake";
import { packingDensityLabel, packingServiceLabel } from "@/lib/moves/intake-display";
import {
  applySelectedServices,
  deriveSelectedServices,
  INTAKE_SERVICE_OPTIONS,
  type IntakeServiceId,
} from "@/lib/moves/intake-services";
import {
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

const ROOM_PRESETS = [
  "Living room",
  "Kitchen",
  "Primary bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Dining room",
  "Office",
  "Garage",
  "Basement",
  "Other",
] as const;

const APPLIANCE_HANDLING_OPTIONS = [
  { value: "", label: "—" },
  { value: "client", label: "Client will handle" },
  { value: "referral", label: "Needs third-party referral" },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function packingSelected(services: IntakeServiceId[]): boolean {
  return services.includes("full-pack") || services.includes("partial-pack");
}

export function ScopeServicesSection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patch } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  const selectedServices = deriveSelectedServices(intake);
  const showPacking = packingSelected(selectedServices);

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
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.services}>
      <DetailSection title="Services">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <div className="min-w-[10rem] flex-1">
            <InlineMultiSelect
              label="Services needed"
              values={selectedServices}
              options={INTAKE_SERVICE_OPTIONS}
              onSave={(ids) => patch(applySelectedServices(ids as IntakeServiceId[]))}
              disabled={disabled}
              placeholder="Select…"
              bubbles
            />
          </div>
          <div className="min-w-[5.5rem]">
            <InlineField
              label="Junk removal"
              type="select"
              options={yesNoOptions}
              value={yesNoValue(intake.hasJunk)}
              onSave={(v) => patch({ hasJunk: parseYesNo(v) })}
              disabled={disabled}
            />
          </div>
          {showPacking ? (
            <div className="min-w-[7rem]">
              <InlineField
                label="Packing service"
                type="select"
                options={packingServiceOptions}
                value={intake.packingService}
                displayValue={packingServiceLabel(intake.packingService)}
                onSave={(v) => patch({ packingService: v as PackingService })}
                disabled={disabled}
              />
            </div>
          ) : null}
          <div className="min-w-[7rem]">
            <InlineField
              label="Belongings density"
              type="select"
              options={packingDensityOptions}
              value={intake.packingDensity}
              displayValue={packingDensityLabel(intake.packingDensity)}
              onSave={(v) => patch({ packingDensity: v as PackingDensity | "" })}
              disabled={disabled}
            />
          </div>
          <div className="min-w-[6.5rem]">
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
          </div>
        </div>

        {intake.jobType === "load-unload-only" ? (
          <div className="mt-3">
          <DetailFieldGrid cols={2}>
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
          </DetailFieldGrid>
          </div>
        ) : null}

        {intake.packingService === "partial" && intake.partialPackRooms.length > 0 ? (
          <p className="mt-2 text-xs text-slate-600">
            Areas to pack:{" "}
            {intake.partialPackRooms.map((r) => PARTIAL_ROOM_LABELS[r] ?? r).join(", ")}
          </p>
        ) : null}

        {intake.hasJunk ? (
          <div className="mt-3 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Haul-off
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <InlineField
                label="Volume"
                value={intake.junkVolume ?? ""}
                onSave={(v) => patch({ junkVolume: v })}
                disabled={disabled}
              />
              <InlineField
                label="Items"
                value={intake.junkItems ?? ""}
                onSave={(v) => patch({ junkItems: v })}
                disabled={disabled}
              />
            </div>
          </div>
        ) : null}
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}

export function ScopeInventorySection({ move }: { move: MoveRecord }) {
  const { intake, disabled, patchFn, patchRoom } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  const floors = [1, 2] as const;
  const roomsByFloor = floors.map((f) => ({
    floor: f,
    rooms: intake.rooms.filter((r) => r.floor === f),
  }));

  function addRoom(floor: 1 | 2) {
    patchFn((prev) => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        { id: newId("room"), floor, name: "Living room", items: "" },
      ],
    }));
  }

  function removeRoom(roomId: string) {
    patchFn((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
    }));
  }

  function addAppliance() {
    patchFn((prev) => ({
      ...prev,
      appliances: [
        ...prev.appliances,
        { id: newId("appliance"), label: "Refrigerator", quantity: 1 },
      ],
    }));
  }

  function updateAppliance(id: string, partial: { label?: string; quantity?: number }) {
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
    <MoveDetailSectionAnchor id={SCOPE_SECTION_IDS.inventory}>
      <DetailSection
        title="Inventory"
        description="Rooms by floor plus appliances to move."
      >
        <div className="space-y-4">
          {roomsByFloor.map(({ floor, rooms }) => (
            <div key={floor}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {floor === 1 ? "First floor" : "Second floor"}
                </p>
                {!disabled ? (
                  <Button type="button" size="sm" variant="secondary" onClick={() => addRoom(floor)}>
                    <Plus className="h-3 w-3" />
                    Room
                  </Button>
                ) : null}
              </div>
              {rooms.length === 0 ? (
                <p className="text-xs text-slate-400">No rooms</p>
              ) : (
                <ul className="space-y-1 rounded-md border border-slate-200 bg-white">
                  {rooms.map((room) => {
                    const presetMatch = ROOM_PRESETS.find((p) => p === room.name);
                    const selectValue = presetMatch ?? "Other";
                    return (
                      <li
                        key={room.id}
                        className="group flex flex-wrap items-center gap-2 border-b border-slate-50 px-2 py-1.5 last:border-0"
                      >
                        <select
                          value={selectValue}
                          disabled={disabled}
                          onChange={(e) => {
                            const v = e.target.value;
                            patchRoom(room.id, { name: v === "Other" ? "" : v });
                          }}
                          className="max-w-[9rem] rounded border border-slate-200 px-1.5 py-1 text-xs"
                        >
                          {ROOM_PRESETS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {selectValue === "Other" ? (
                          <input
                            value={room.name}
                            disabled={disabled}
                            onChange={(e) => patchRoom(room.id, { name: e.target.value })}
                            placeholder="Room name"
                            className="min-w-[5rem] flex-1 rounded border border-slate-200 px-1.5 py-1 text-xs"
                          />
                        ) : null}
                        <input
                          value={room.items}
                          disabled={disabled}
                          onChange={(e) => patchRoom(room.id, { items: e.target.value })}
                          placeholder="Items in room…"
                          className="min-w-[8rem] flex-[2] rounded border border-slate-200 px-1.5 py-1 text-xs"
                        />
                        {!disabled ? (
                          <button
                            type="button"
                            onClick={() => removeRoom(room.id)}
                            className="rounded p-0.5 text-slate-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                            aria-label="Remove room"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Appliances
            </p>
            {!disabled ? (
              <Button type="button" size="sm" variant="secondary" onClick={addAppliance}>
                <Plus className="h-3 w-3" />
                Add
              </Button>
            ) : null}
          </div>
          {intake.appliances.length === 0 ? (
            <p className="text-xs text-slate-400">None</p>
          ) : (
            <ul className="space-y-1">
              {intake.appliances.map((a) => (
                <li key={a.id} className="group flex items-center gap-2 text-xs">
                  <input
                    value={a.label}
                    disabled={disabled}
                    onChange={(e) => updateAppliance(a.id, { label: e.target.value })}
                    className="min-w-[6rem] flex-1 rounded border border-slate-200 px-1.5 py-1"
                  />
                  <input
                    type="number"
                    value={a.quantity}
                    disabled={disabled}
                    onChange={(e) =>
                      updateAppliance(a.id, {
                        quantity: e.target.value ? Math.max(1, Number(e.target.value)) : 1,
                      })
                    }
                    className="w-12 rounded border border-slate-200 px-1 py-1 tabular-nums"
                    aria-label="Quantity"
                  />
                  {!disabled ? (
                    <button
                      type="button"
                      onClick={() => removeAppliance(a.id)}
                      className="text-slate-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 max-w-xs">
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
                patchFn((prev) => ({
                  ...prev,
                  applianceDisconnectHandling: v as "client" | "referral" | "",
                }))
              }
              disabled={disabled}
            />
          </div>
        </div>
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
