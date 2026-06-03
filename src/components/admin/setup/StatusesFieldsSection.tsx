"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import type { FieldCatalogEntry, FieldCatalogGroup } from "@/lib/settings/field-catalog-types";
import { uniqueCatalogId } from "@/lib/settings/field-catalog-defaults";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { LOST_QUALIFICATION_LABELS, type LostQualification } from "@/lib/moves/lost-reasons";
import { Plus, Trash2 } from "lucide-react";

type GroupConfig = {
  key: FieldCatalogGroup;
  title: string;
  hint: string;
  showDescription?: boolean;
  showHotToggle?: boolean;
  showHideFromBoard?: boolean;
  showQualification?: boolean;
  showShortCode?: boolean;
  showMeaning?: boolean;
  lostQualification?: LostQualification;
};

const GROUPS: GroupConfig[] = [
  {
    key: "pipelineStages",
    title: "Pipeline stages",
    hint: "Used on the /moves board, move detail stepper, and lifecycle actions.",
    showDescription: true,
    showHideFromBoard: true,
  },
  {
    key: "waitingSubstages",
    title: "Waiting substages",
    hint: "Shown when a move is in Waiting — picked on move detail and pipeline cards.",
    showDescription: true,
  },
  {
    key: "conditionStatuses",
    title: "Move condition",
    hint: "Separate from pipeline stage — lost, on hold, needs review, etc.",
    showDescription: true,
  },
  {
    key: "leadSources",
    title: "Lead sources",
    hint: "How the customer found you — hot sources boost priority tier.",
    showDescription: true,
    showHotToggle: true,
  },
  {
    key: "moveTypes",
    title: "Move types",
    hint: "Service classification on moves, jobs, and profitability.",
  },
  {
    key: "priorityTiers",
    title: "Priority tags",
    hint: "Auto-assigned from lead source heat + estimated move value.",
    showMeaning: true,
    showShortCode: true,
  },
  {
    key: "lostReasons",
    title: `Lost reasons · ${LOST_QUALIFICATION_LABELS.unqualified}`,
    hint: "Used when marking a lead lost before it was a real sales opportunity.",
    showDescription: true,
    showQualification: true,
    lostQualification: "unqualified",
  },
  {
    key: "lostReasons",
    title: `Lost reasons · ${LOST_QUALIFICATION_LABELS.qualified}`,
    hint: "Used when you quoted or pursued a real move that did not book.",
    showDescription: true,
    showQualification: true,
    lostQualification: "qualified",
  },
];

export function StatusesFieldsSection() {
  const { value: fieldCatalog, update } = useSettingsSection("fieldCatalog");

  function setGroup(key: FieldCatalogGroup, entries: FieldCatalogEntry[]) {
    update({ [key]: entries });
  }

  function patchEntry(key: FieldCatalogGroup, id: string, patch: Partial<FieldCatalogEntry>) {
    const list = fieldCatalog[key];
    setGroup(
      key,
      list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function removeEntry(key: FieldCatalogGroup, id: string) {
    setGroup(
      key,
      fieldCatalog[key].filter((e) => e.id !== id || e.builtIn),
    );
  }

  function addEntry(key: FieldCatalogGroup, partial: Partial<FieldCatalogEntry>) {
    const list = fieldCatalog[key];
    const label = partial.label ?? "New item";
    const entry: FieldCatalogEntry = {
      id: uniqueCatalogId(label, list),
      label,
      description: partial.description ?? "",
      builtIn: false,
      qualification: partial.qualification,
      isHot: partial.isHot ?? false,
      hideFromBoard: partial.hideFromBoard ?? false,
      shortCode: partial.shortCode,
      meaning: partial.meaning,
      badgeClass: partial.badgeClass ?? "bg-slate-100 text-slate-600",
    };
    setGroup(key, [...list, entry]);
  }

  return (
    <div className="space-y-3">
      {GROUPS.map((group) => {
        const entries = fieldCatalog[group.key].filter((e) =>
          group.lostQualification ? e.qualification === group.lostQualification : true,
        );
        const groupKey = group.lostQualification
          ? `${group.key}-${group.lostQualification}`
          : group.key;

        return (
          <SetupAccordion
            key={groupKey}
            title={group.title}
            description={group.hint}
            count={entries.length}
          >
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-2">
                      <SettingsField label="Label">
                        <SettingsInput
                          value={entry.label}
                          onChange={(e) =>
                            patchEntry(group.key, entry.id, { label: e.target.value })
                          }
                        />
                      </SettingsField>
                      {group.showShortCode ? (
                        <SettingsField label="Short code">
                          <SettingsInput
                            value={entry.shortCode ?? ""}
                            onChange={(e) =>
                              patchEntry(group.key, entry.id, { shortCode: e.target.value })
                            }
                          />
                        </SettingsField>
                      ) : null}
                    </div>
                    {!entry.builtIn ? (
                      <button
                        type="button"
                        onClick={() => removeEntry(group.key, entry.id)}
                        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  {group.showDescription || group.showMeaning ? (
                    <SettingsField label={group.showMeaning ? "Meaning" : "Description (optional)"}>
                      <SettingsInput
                        value={
                          group.showMeaning ? (entry.meaning ?? entry.description ?? "") : (entry.description ?? "")
                        }
                        onChange={(e) =>
                          patchEntry(group.key, entry.id, group.showMeaning
                            ? { meaning: e.target.value }
                            : { description: e.target.value })
                        }
                      />
                    </SettingsField>
                  ) : null}
                  <div className="flex flex-wrap gap-4">
                    {group.showHotToggle ? (
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={entry.isHot ?? false}
                          onChange={(e) =>
                            patchEntry(group.key, entry.id, { isHot: e.target.checked })
                          }
                          className="rounded border-slate-300"
                        />
                        Hot lead source
                      </label>
                    ) : null}
                    {group.showHideFromBoard ? (
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={entry.hideFromBoard ?? false}
                          onChange={(e) =>
                            patchEntry(group.key, entry.id, { hideFromBoard: e.target.checked })
                          }
                          className="rounded border-slate-300"
                        />
                        Hide from pipeline board
                      </label>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    ID: {entry.id}
                    {entry.builtIn ? " · built-in" : ""}
                  </p>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 gap-1"
              onClick={() =>
                addEntry(group.key, {
                  label: "New item",
                  qualification: group.lostQualification,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add {group.title.toLowerCase().replace(/lost reasons · /i, "")}
            </Button>
          </SetupAccordion>
        );
      })}
    </div>
  );
}

export function fieldCatalogCount(catalog: FieldCatalogSettings): number {
  return (
    catalog.pipelineStages.length +
    catalog.waitingSubstages.length +
    catalog.conditionStatuses.length +
    catalog.leadSources.length +
    catalog.moveTypes.length +
    catalog.priorityTiers.length +
    catalog.lostReasons.length
  );
}
