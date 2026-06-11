"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import type {
  FieldCatalogEntry,
  FieldCatalogEntryGroup,
} from "@/lib/settings/field-catalog-types";
import { uniqueCatalogId } from "@/lib/settings/field-catalog-defaults";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { LOST_QUALIFICATION_LABELS, type LostQualification } from "@/lib/moves/lost-reasons";
import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

const COMPACT_INPUT =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type GroupConfig = {
  key: FieldCatalogEntryGroup;
  title: string;
  hint: string;
  showDescription?: boolean;
  showHideFromBoard?: boolean;
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
    hint: "How the customer found you — hot/cold and Q1–Q4 quadrants are under Setup → Leads.",
    showDescription: true,
  },
  {
    key: "lostReasons",
    title: `Lost reasons · ${LOST_QUALIFICATION_LABELS.unqualified}`,
    hint: "Used when marking a lead lost before it was a real sales opportunity.",
    showDescription: true,
    lostQualification: "unqualified",
  },
  {
    key: "lostReasons",
    title: `Lost reasons · ${LOST_QUALIFICATION_LABELS.qualified}`,
    hint: "Used when you quoted or pursued a real move that did not book.",
    showDescription: true,
    lostQualification: "qualified",
  },
];

export function StatusesFieldsSection() {
  const { value: fieldCatalog, update } = useSettingsSection("fieldCatalog");

  function setGroup(key: FieldCatalogEntryGroup, entries: FieldCatalogEntry[]) {
    update({ [key]: entries });
  }

  function patchEntry(key: FieldCatalogEntryGroup, id: string, patch: Partial<FieldCatalogEntry>) {
    const list = fieldCatalog[key];
    setGroup(
      key,
      list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function removeEntry(key: FieldCatalogEntryGroup, id: string) {
    setGroup(
      key,
      fieldCatalog[key].filter((e) => e.id !== id || e.builtIn),
    );
  }

  function addEntry(key: FieldCatalogEntryGroup, partial: Partial<FieldCatalogEntry>) {
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
    <div className="space-y-2">
      {GROUPS.map((group) => {
        const entries = fieldCatalog[group.key].filter((e) =>
          group.lostQualification ? e.qualification === group.lostQualification : true,
        );
        const groupKey = group.lostQualification
          ? `${group.key}-${group.lostQualification}`
          : group.key;
        const secondaryLabel = group.showMeaning
          ? "Meaning"
          : group.showDescription
            ? "Description"
            : null;

        return (
          <SetupAccordion
            key={groupKey}
            title={group.title}
            description={group.hint}
            count={entries.length}
          >
            {secondaryLabel || group.showShortCode || group.showHideFromBoard ? (
              <div
                className="mb-1.5 hidden gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:grid"
                style={catalogRowStyle(group)}
              >
                <span>Label</span>
                {group.showShortCode ? <span>Code</span> : null}
                {secondaryLabel ? <span>{secondaryLabel}</span> : null}
                {group.showHideFromBoard ? <span className="text-center">Board</span> : null}
                <span className="sr-only">Actions</span>
              </div>
            ) : null}
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  title={`${entry.id}${entry.builtIn ? " · built-in" : ""}`}
                  className="flex flex-wrap items-center gap-2 px-2.5 py-1.5 sm:grid sm:gap-2"
                  style={catalogRowStyle(group)}
                >
                  <SettingsInput
                    value={entry.label}
                    onChange={(e) => patchEntry(group.key, entry.id, { label: e.target.value })}
                    placeholder="Label"
                    className={COMPACT_INPUT}
                    aria-label="Label"
                  />
                  {group.showShortCode ? (
                    <SettingsInput
                      value={entry.shortCode ?? ""}
                      onChange={(e) =>
                        patchEntry(group.key, entry.id, { shortCode: e.target.value })
                      }
                      placeholder="Q1"
                      className={COMPACT_INPUT}
                      aria-label="Short code"
                    />
                  ) : null}
                  {secondaryLabel ? (
                    <SettingsInput
                      value={
                        group.showMeaning
                          ? (entry.meaning ?? entry.description ?? "")
                          : (entry.description ?? "")
                      }
                      onChange={(e) =>
                        patchEntry(
                          group.key,
                          entry.id,
                          group.showMeaning
                            ? { meaning: e.target.value }
                            : { description: e.target.value },
                        )
                      }
                      placeholder={secondaryLabel}
                      className={COMPACT_INPUT}
                      aria-label={secondaryLabel}
                    />
                  ) : null}
                  {group.showHideFromBoard ? (
                    <label className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={entry.hideFromBoard ?? false}
                        onChange={(e) =>
                          patchEntry(group.key, entry.id, { hideFromBoard: e.target.checked })
                        }
                        className="rounded border-slate-300"
                        title="Hide from pipeline board"
                      />
                      <span className="sm:hidden">Hide board</span>
                    </label>
                  ) : null}
                  <div className="flex justify-end sm:justify-center">
                    {!entry.builtIn ? (
                      <button
                        type="button"
                        onClick={() => removeEntry(group.key, entry.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="w-7" aria-hidden />
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 gap-1"
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

function catalogRowStyle(group: GroupConfig): CSSProperties {
  const cols: string[] = ["minmax(7rem,1.2fr)"];
  if (group.showShortCode) cols.push("5rem");
  if (group.showDescription || group.showMeaning) cols.push("minmax(8rem,2fr)");
  if (group.showHideFromBoard) cols.push("3.5rem");
  cols.push("2rem");
  return { gridTemplateColumns: cols.join(" ") };
}

export function fieldCatalogCount(catalog: FieldCatalogSettings): number {
  return (
    catalog.pipelineStages.length +
    catalog.waitingSubstages.length +
    catalog.conditionStatuses.length +
    catalog.leadSources.length +
    catalog.moveTypes.length +
    catalog.lostReasons.length
  );
}
