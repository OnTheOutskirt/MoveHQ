"use client";

import { MoveTypeDeleteDialog } from "@/components/admin/setup/MoveTypeDeleteDialog";
import { MoveTypeEditorSidebar } from "@/components/admin/setup/MoveTypeEditorSidebar";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { uniqueCatalogId } from "@/lib/settings/field-catalog-defaults";
import {
  countMovesUsingMoveType,
  moveTypeRuleSummary,
  removeMoveTypeFromCatalog,
  removeMoveTypeFromRules,
} from "@/lib/settings/move-type-migration";
import { patchMoveTypeRule, resolveMoveTypeRule } from "@/lib/settings/move-type-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function MoveTypesTab() {
  const { moves, reassignMovesFromDeletedMoveType } = useMoves();
  const { value: fieldCatalog, update: updateFieldCatalog } = useSettingsSection("fieldCatalog");
  const { value: moveTypeRules, update: updateMoveTypeRules } = useSettingsSection("moveTypeRules");

  const types = fieldCatalog.moveTypes;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingEntry = types.find((t) => t.id === editingId) ?? null;
  const editingRule = editingId
    ? resolveMoveTypeRule(editingId, moveTypeRules)
    : null;

  const deletingEntry = types.find((t) => t.id === deletingId) ?? null;
  const deletingCount = deletingId ? countMovesUsingMoveType(moves, deletingId) : 0;
  const replacementOptions = useMemo(
    () => types.filter((t) => t.id !== deletingId),
    [types, deletingId],
  );

  function patchLabel(id: string, label: string) {
    updateFieldCatalog({
      moveTypes: fieldCatalog.moveTypes.map((t) => (t.id === id ? { ...t, label } : t)),
    });
  }

  function addType() {
    const label = "New move type";
    const entry = {
      id: uniqueCatalogId(label, types),
      label,
      builtIn: false,
    };
    updateFieldCatalog({ moveTypes: [...types, entry] });
    updateMoveTypeRules(
      patchMoveTypeRule(moveTypeRules, entry.id, {
        hourlyTravelBilling: "clock_between_stops",
        includesLiabilityCoverage: true,
        defaultPricingType: "hourly",
        opsNotes: "",
      }),
    );
    setEditingId(entry.id);
  }

  function confirmDelete(replacementTypeId: string) {
    if (!deletingId || !deletingEntry) return;

    if (deletingCount > 0) {
      reassignMovesFromDeletedMoveType(
        deletingId,
        replacementTypeId,
        moveTypeRules,
        fieldCatalog,
      );
    }

    updateFieldCatalog(removeMoveTypeFromCatalog(fieldCatalog, deletingId));
    updateMoveTypeRules(removeMoveTypeFromRules(moveTypeRules, deletingId));
    setDeletingId(null);
    if (editingId === deletingId) setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Move types drive hourly billing, liability coverage, and default pricing — not just labels
        on a move card. Use <span className="font-medium text-slate-800">Edit</span> to change rules;
        deleting a type reassigns affected moves to a new type and updates their settings.
      </p>

      <SetupAccordion
        title="Move types & service rules"
        description="How each service type is billed and covered."
        count={types.length}
      >
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {types.map((type) => {
            const rule = resolveMoveTypeRule(type.id, moveTypeRules);
            const assigned = countMovesUsingMoveType(moves, type.id);
            const shortTravel =
              rule.hourlyTravelBilling === "flat_travel_fee_only"
                ? "Flat travel fee"
                : "Clock drive time";

            return (
              <li
                key={type.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{type.label}</p>
                    {type.builtIn ? (
                      <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-600">
                        Built-in
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{moveTypeRuleSummary(rule)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{shortTravel}</p>
                  {assigned > 0 ? (
                    <p className="mt-1 text-xs text-slate-600">
                      {assigned} active move{assigned === 1 ? "" : "s"} using this type
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingId(type.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  {!type.builtIn ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="text-red-700 hover:bg-red-50"
                      onClick={() => setDeletingId(type.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <Button type="button" variant="secondary" size="sm" className="mt-3 gap-1" onClick={addType}>
          <Plus className="h-3.5 w-3.5" />
          Add move type
        </Button>
      </SetupAccordion>

      <p className="text-xs text-slate-500">
        Hourly travel fees themselves are set under{" "}
        <Link href="/admin/setup?tab=rates" className="font-medium text-brand-600 hover:underline">
          Rates &amp; catalog
        </Link>
        . Long-distance moves use the flat travel fee; local moves clock drive time on the hourly
        rate.
      </p>

      <MoveTypeEditorSidebar
        open={editingId != null}
        entry={editingEntry}
        rule={editingRule}
        moveTypeRules={moveTypeRules}
        onClose={() => setEditingId(null)}
        onSaveLabel={(label) => editingId && patchLabel(editingId, label)}
        onSaveRules={updateMoveTypeRules}
      />

      <MoveTypeDeleteDialog
        open={deletingId != null}
        entry={deletingEntry}
        affectedCount={deletingCount}
        replacementOptions={replacementOptions}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
