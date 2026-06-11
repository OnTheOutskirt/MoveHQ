"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import type { IntakeThirdPartyService } from "@/lib/moves/flat-rate-intake";
import {
  newThirdPartyServiceId,
  normalizeThirdPartyServices,
  THIRD_PARTY_SERVICE_TYPES,
  thirdPartyServiceLabel,
} from "@/lib/moves/third-party-services";
import { listVendorDirectoryOptions, resolveVendorDirectoryLabel } from "@/lib/people/vendors";
import { EQUIPMENT_SECTION_IDS } from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

type ThirdPartyServicesSectionProps = {
  move: MoveRecord;
};

export function ThirdPartyServicesSection({ move }: ThirdPartyServicesSectionProps) {
  const { intake, disabled, patchFn } = useMoveIntakeEdit(move.id);
  const vendors = useMemo(() => listVendorDirectoryOptions(), []);

  if (!intake) return null;

  const lines = normalizeThirdPartyServices(intake.thirdPartyServices);

  function updateLines(next: IntakeThirdPartyService[]) {
    patchFn((prev) => ({ ...prev, thirdPartyServices: next }));
  }

  function patchLine(id: string, patch: Partial<IntakeThirdPartyService>) {
    updateLines(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    updateLines([
      ...lines,
      {
        id: newThirdPartyServiceId(),
        serviceTypeId: "crating",
        vendorDirectoryId: vendors[0]?.id ?? null,
      },
    ]);
  }

  function removeLine(id: string) {
    updateLines(lines.filter((l) => l.id !== id));
  }

  return (
    <MoveDetailSectionAnchor id={EQUIPMENT_SECTION_IDS.thirdParty}>
      <DetailSection
        title="Third-party services"
        description="Subcontracted work — crating, specialty haul, etc. Vendors come from your directory (Sales → Directory, kind: vendor)."
      >
        {lines.length === 0 ? (
          <p className="text-sm text-slate-500">
            None scheduled. Add crating, piano specialists, junk haul, or other vendors.
          </p>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.id}
                className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="flex flex-wrap items-start gap-2">
                  <SettingsField label="Service" className="min-w-[10rem] flex-1">
                    <SettingsSelect
                      value={line.serviceTypeId}
                      disabled={disabled}
                      onChange={(e) =>
                        patchLine(line.id, { serviceTypeId: e.target.value })
                      }
                    >
                      {THIRD_PARTY_SERVICE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </SettingsSelect>
                  </SettingsField>
                  <SettingsField label="Vendor" className="min-w-[12rem] flex-1">
                    <SettingsSelect
                      value={line.vendorDirectoryId ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        patchLine(line.id, {
                          vendorDirectoryId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Select vendor…</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </SettingsSelect>
                  </SettingsField>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeLine(line.id)}
                    className="mt-6 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Remove ${thirdPartyServiceLabel(line)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {line.serviceTypeId === "other" ? (
                  <SettingsField label="Service name">
                    <SettingsInput
                      value={line.customLabel ?? ""}
                      disabled={disabled}
                      onChange={(e) => patchLine(line.id, { customLabel: e.target.value })}
                      placeholder="Describe the service"
                    />
                  </SettingsField>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  <SettingsField label="Est. cost ($)" hint="Optional — internal / quote">
                    <SettingsInput
                      type="number"
                      min={0}
                      value={line.estimatedCost ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        patchLine(line.id, {
                          estimatedCost: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </SettingsField>
                  <SettingsField label="Notes">
                    <SettingsInput
                      value={line.notes ?? ""}
                      disabled={disabled}
                      onChange={(e) => patchLine(line.id, { notes: e.target.value })}
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
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3 gap-1"
          disabled={disabled}
          onClick={addLine}
        >
          <Plus className="h-3.5 w-3.5" />
          Add third-party service
        </Button>
      </DetailSection>
    </MoveDetailSectionAnchor>
  );
}
