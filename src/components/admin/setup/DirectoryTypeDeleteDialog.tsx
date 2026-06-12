"use client";

import { Button } from "@/components/ui/Button";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import { catalogEntryLabel } from "@/lib/settings/move-type-migration";
import { useEffect, useMemo, useState } from "react";

type DirectoryTypeKind = "referralTypes" | "vendorTypes";

type DirectoryTypeDeleteDialogProps = {
  open: boolean;
  kind: DirectoryTypeKind;
  entry: FieldCatalogEntry | null;
  affectedCount: number;
  replacementOptions: FieldCatalogEntry[];
  onClose: () => void;
  onConfirm: (replacementTypeId: string) => void;
};

const KIND_COPY: Record<
  DirectoryTypeKind,
  { noun: string; contactNoun: string; deleteLabel: string }
> = {
  referralTypes: {
    noun: "referral type",
    contactNoun: "referral contact",
    deleteLabel: "Delete referral type",
  },
  vendorTypes: {
    noun: "vendor type",
    contactNoun: "vendor contact",
    deleteLabel: "Delete vendor type",
  },
};

export function DirectoryTypeDeleteDialog({
  open,
  kind,
  entry,
  affectedCount,
  replacementOptions,
  onClose,
  onConfirm,
}: DirectoryTypeDeleteDialogProps) {
  const copy = KIND_COPY[kind];
  const [replacementId, setReplacementId] = useState("");

  const defaultReplacement = useMemo(() => {
    const preferred = kind === "referralTypes" ? "other" : null;
    if (preferred && replacementOptions.some((t) => t.id === preferred)) {
      return preferred;
    }
    return replacementOptions[0]?.id ?? "";
  }, [kind, replacementOptions]);

  useEffect(() => {
    if (!open) return;
    setReplacementId(defaultReplacement);
  }, [open, defaultReplacement, entry?.id]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !entry) return null;

  const typeLabel = catalogEntryLabel(entry);
  const canConfirm = replacementOptions.length > 0 && (affectedCount === 0 || replacementId);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="directory-type-delete-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="directory-type-delete-title" className="text-lg font-semibold text-slate-900">
          Delete {typeLabel}?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure? This {copy.noun} will be removed from setup and directory filters.
        </p>

        {affectedCount > 0 ? (
          <div className="mt-4 space-y-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3">
            <p className="text-sm font-medium text-amber-950">
              {affectedCount} {copy.contactNoun}
              {affectedCount === 1 ? "" : "s"} currently use{" "}
              <span className="font-semibold">{typeLabel}</span>.
            </p>
            <p className="text-xs text-amber-900">
              Choose a replacement type — each affected contact will be reassigned before this type
              is removed.
            </p>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                Reassign to
              </span>
              <select
                value={replacementId}
                onChange={(e) => setReplacementId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
              >
                {replacementOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {catalogEntryLabel(opt)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No directory contacts are using this type.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!canConfirm}
            onClick={() => {
              if (affectedCount > 0 && replacementId) {
                onConfirm(replacementId);
              } else {
                onConfirm(defaultReplacement);
              }
              onClose();
            }}
          >
            {copy.deleteLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
