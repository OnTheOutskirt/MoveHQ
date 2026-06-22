"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import type { IntakeThirdPartyService } from "@/lib/moves/flat-rate-intake";
import { EQUIPMENT_SECTION_IDS } from "@/lib/moves/move-detail-sections";
import {
  newThirdPartyServiceId,
  normalizeThirdPartyServices,
  thirdPartyVendorTypeLabel,
} from "@/lib/moves/third-party-services";
import {
  listVendorDirectoryOptions,
  resolveVendorDirectoryLabel,
  vendorDirectoryOptionMatchesVendorType,
  type ListVendorDirectoryOptionsConfig,
} from "@/lib/people/vendors";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus, Trash2 } from "lucide-react";

/** Move vendor picker pulls from the organization directory, filtered by vendor type. */
const VENDOR_PICKER_CONFIG: ListVendorDirectoryOptionsConfig = { organizationsOnly: true };

type ThirdPartyServicesSectionProps = {
  move: MoveRecord;
};

export function ThirdPartyServicesSection({ move }: ThirdPartyServicesSectionProps) {
  const { settings } = useSettings();
  const vendorTypes = settings.fieldCatalog.vendorTypes;
  const { intake, disabled, patchFn } = useMoveIntakeEdit(move.id);

  if (!intake) return null;

  const lines = normalizeThirdPartyServices(intake.thirdPartyServices);
  const defaultVendorTypeId = vendorTypes[0]?.id ?? "special_services";

  function updateLines(next: IntakeThirdPartyService[]) {
    patchFn((prev) => ({ ...prev, thirdPartyServices: next }));
  }

  function patchLine(id: string, patch: Partial<IntakeThirdPartyService>) {
    updateLines(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function addLine() {
    const vendors = listVendorDirectoryOptions(defaultVendorTypeId, VENDOR_PICKER_CONFIG);
    updateLines([
      ...lines,
      {
        id: newThirdPartyServiceId(),
        serviceTypeId: defaultVendorTypeId,
        vendorDirectoryId: vendors[0]?.id ?? null,
      },
    ]);
  }

  function removeLine(id: string) {
    updateLines(lines.filter((line) => line.id !== id));
  }

  function changeVendorType(line: IntakeThirdPartyService, vendorTypeId: string) {
    const patch: Partial<IntakeThirdPartyService> = { serviceTypeId: vendorTypeId };
    if (
      line.vendorDirectoryId &&
      !vendorDirectoryOptionMatchesVendorType(line.vendorDirectoryId, vendorTypeId, VENDOR_PICKER_CONFIG)
    ) {
      patch.vendorDirectoryId =
        listVendorDirectoryOptions(vendorTypeId, VENDOR_PICKER_CONFIG)[0]?.id ?? null;
    }
    patchLine(line.id, patch);
  }

  return (
    <MoveDetailSectionAnchor id={EQUIPMENT_SECTION_IDS.thirdParty}>
      <DetailSection
        title="Third-party services"
        description="Subcontracted vendors by type from Setup → Pipelines & fields. Scheduled items flow to Jobs ops prep."
      >
        {lines.length === 0 ? (
          <p className="text-sm text-slate-500">
            None scheduled. Add crating, specialty haul, materials partners, or other vendor types.
          </p>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => {
              const vendors = listVendorDirectoryOptions(line.serviceTypeId, VENDOR_PICKER_CONFIG);
              return (
                <li
                  key={line.id}
                  className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <SettingsField label="Vendor type" className="min-w-[10rem] flex-1">
                      <SettingsSelect
                        value={line.serviceTypeId}
                        disabled={disabled}
                        onChange={(event) => changeVendorType(line, event.target.value)}
                      >
                        {vendorTypes.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.label}
                          </option>
                        ))}
                      </SettingsSelect>
                    </SettingsField>
                    <SettingsField label="Vendor" className="min-w-[12rem] flex-1">
                      <SettingsSelect
                        value={line.vendorDirectoryId ?? ""}
                        disabled={disabled}
                        onChange={(event) =>
                          patchLine(line.id, {
                            vendorDirectoryId: event.target.value || null,
                          })
                        }
                      >
                        <option value="">
                          {vendors.length === 0 ? "No vendors for this type" : "Select vendor…"}
                        </option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.label}
                          </option>
                        ))}
                      </SettingsSelect>
                    </SettingsField>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeLine(line.id)}
                      className="mt-6 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Remove ${thirdPartyVendorTypeLabel(line)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <SettingsField label="Est. cost ($)" hint="Optional — internal / quote">
                      <SettingsInput
                        type="number"
                        min={0}
                        value={line.estimatedCost ?? ""}
                        disabled={disabled}
                        onChange={(event) =>
                          patchLine(line.id, {
                            estimatedCost: event.target.value ? Number(event.target.value) : null,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField label="Notes">
                      <SettingsInput
                        value={line.notes ?? ""}
                        disabled={disabled}
                        onChange={(event) => patchLine(line.id, { notes: event.target.value })}
                        placeholder="Scope, timing, PO…"
                      />
                    </SettingsField>
                  </div>
                  {line.vendorDirectoryId ? (
                    <p className="text-xs text-slate-500">
                      {resolveVendorDirectoryLabel(line.vendorDirectoryId)}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3 gap-1"
          disabled={disabled || vendorTypes.length === 0}
          onClick={addLine}
        >
          <Plus className="h-3.5 w-3.5" />
          Add third-party service
        </Button>
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}
