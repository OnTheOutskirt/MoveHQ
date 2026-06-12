"use client";

import { DirectoryTypeDeleteDialog } from "@/components/admin/setup/DirectoryTypeDeleteDialog";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import {
  countPeopleUsingReferralType,
  countPeopleUsingVendorType,
  reassignReferralType,
  reassignVendorType,
} from "@/lib/people/directory-type-migration";
import { listAllPeople } from "@/lib/people/people-storage";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import { uniqueCatalogId } from "@/lib/settings/field-catalog-defaults";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

const COMPACT_INPUT =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type DirectoryTypeGroup = {
  key: "referralTypes" | "vendorTypes";
  title: string;
  hint: string;
};

const GROUPS: DirectoryTypeGroup[] = [
  {
    key: "referralTypes",
    title: "Referral types",
    hint: "Categories for referral contacts — shown as filters in Directory → Contacts and Organizations when Referral contact is selected.",
  },
  {
    key: "vendorTypes",
    title: "Vendor types",
    hint: "Categories for vendor contacts — shown as filters in Directory → Contacts and Organizations when Vendor is selected.",
  },
];

type DeletingState = {
  key: DirectoryTypeGroup["key"];
  id: string;
} | null;

export function DirectoryTypesSection() {
  const { value: fieldCatalog, update } = useSettingsSection("fieldCatalog");
  const [deleting, setDeleting] = useState<DeletingState>(null);

  function setGroup(key: DirectoryTypeGroup["key"], entries: FieldCatalogEntry[]) {
    update({ [key]: entries });
  }

  function patchEntry(
    key: DirectoryTypeGroup["key"],
    id: string,
    patch: Partial<FieldCatalogEntry>,
  ) {
    const list = fieldCatalog[key];
    setGroup(
      key,
      list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function addEntry(key: DirectoryTypeGroup["key"]) {
    const list = fieldCatalog[key];
    const entry: FieldCatalogEntry = {
      id: uniqueCatalogId("New type", list),
      label: "New type",
      builtIn: false,
      badgeClass: "bg-slate-100 text-slate-700",
    };
    setGroup(key, [...list, entry]);
  }

  const deletingEntry = useMemo(() => {
    if (!deleting) return null;
    return fieldCatalog[deleting.key].find((e) => e.id === deleting.id) ?? null;
  }, [deleting, fieldCatalog]);

  const deletingAffectedCount = useMemo(() => {
    if (!deleting) return 0;
    const people = listAllPeople();
    return deleting.key === "referralTypes"
      ? countPeopleUsingReferralType(people, deleting.id)
      : countPeopleUsingVendorType(people, deleting.id);
  }, [deleting]);

  const replacementOptions = useMemo(() => {
    if (!deleting) return [];
    return fieldCatalog[deleting.key].filter((e) => e.id !== deleting.id);
  }, [deleting, fieldCatalog]);

  function confirmDelete(replacementTypeId: string) {
    if (!deleting || !deletingEntry) return;

    if (deletingAffectedCount > 0) {
      if (deleting.key === "referralTypes") {
        reassignReferralType(deleting.id, replacementTypeId);
      } else {
        reassignVendorType(deleting.id, replacementTypeId);
      }
    }

    setGroup(
      deleting.key,
      fieldCatalog[deleting.key].filter((e) => e.id !== deleting.id),
    );
    setDeleting(null);
  }

  return (
    <div className="space-y-2">
      {GROUPS.map((group) => {
        const entries = fieldCatalog[group.key];
        const canDeleteAny = entries.length > 1;

        return (
          <SetupAccordion
            key={group.key}
            title={group.title}
            description={group.hint}
            count={entries.length}
          >
            <div className="mb-1.5 hidden gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[1fr_2rem]">
              <span>Label</span>
              <span className="sr-only">Actions</span>
            </div>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  title={entry.id}
                  className="flex flex-wrap items-center gap-2 px-2.5 py-1.5 sm:grid sm:grid-cols-[1fr_2rem] sm:gap-2"
                >
                  <SettingsInput
                    value={entry.label}
                    onChange={(e) => patchEntry(group.key, entry.id, { label: e.target.value })}
                    placeholder="Label"
                    className={COMPACT_INPUT}
                    aria-label="Label"
                  />
                  <div className="flex justify-end sm:justify-center">
                    <button
                      type="button"
                      disabled={!canDeleteAny}
                      onClick={() => setDeleting({ key: group.key, id: entry.id })}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      title={
                        canDeleteAny
                          ? "Remove type"
                          : "Add another type before removing the last one"
                      }
                      aria-label={`Remove ${entry.label}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 gap-1"
              onClick={() => addEntry(group.key)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add {group.title.toLowerCase().replace(/s$/, "")}
            </Button>
          </SetupAccordion>
        );
      })}

      <DirectoryTypeDeleteDialog
        open={deleting != null}
        kind={deleting?.key ?? "referralTypes"}
        entry={deletingEntry}
        affectedCount={deletingAffectedCount}
        replacementOptions={replacementOptions}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
