"use client";

import { MoveCalendarSearchPicker } from "@/components/calendar/MoveCalendarSearchPicker";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { toDateKey } from "@/lib/calendar/date-utils";
import { addManualOpsPrepTask } from "@/lib/operations/ops-prep-custom-storage";
import {
  MANUAL_OPS_PREP_NO_MOVE_LABEL,
  opsPrepCategoryForVendorType,
} from "@/lib/operations/ops-prep-manual";
import { activeJobDaysForMove } from "@/lib/operations/ops-prep-tasks";
import { catalogVendorTypeLabel } from "@/lib/settings/field-catalog-runtime";
import {
  listVendorDirectoryOptions,
  resolveVendorDirectoryLabel,
  vendorDirectoryOptionMatchesVendorType,
} from "@/lib/people/vendors";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type OpsPrepAddSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function defaultTitle(vendorTypeId: string, vendorDirectoryId: string | null): string {
  const typeLabel = catalogVendorTypeLabel(vendorTypeId);
  if (vendorDirectoryId) {
    const vendorName = resolveVendorDirectoryLabel(vendorDirectoryId);
    if (vendorName) return `Book ${vendorName}`;
  }
  return `Schedule ${typeLabel.toLowerCase()}`;
}

export function OpsPrepAddSidebar({ open, onClose }: OpsPrepAddSidebarProps) {
  const { settings } = useSettings();
  const vendorTypes = settings.fieldCatalog.vendorTypes;
  const defaultVendorTypeId = vendorTypes[0]?.id ?? "special_services";

  const [selectedMove, setSelectedMove] = useState<MoveRecord | null>(null);
  const [jobDayId, setJobDayId] = useState("");
  const [title, setTitle] = useState("");
  const [titleManual, setTitleManual] = useState(false);
  const [detail, setDetail] = useState("");
  const [vendorTypeId, setVendorTypeId] = useState(defaultVendorTypeId);
  const [vendorDirectoryId, setVendorDirectoryId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(toDateKey(new Date()));

  const jobDays = selectedMove ? activeJobDaysForMove(selectedMove) : [];
  const vendorOptions = useMemo(
    () => listVendorDirectoryOptions(vendorTypeId),
    [vendorTypeId],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedMove(null);
    setJobDayId("");
    setTitle("");
    setTitleManual(false);
    setDetail("");
    setVendorTypeId(defaultVendorTypeId);
    setVendorDirectoryId(null);
    setDueDate(toDateKey(new Date()));
  }, [open, defaultVendorTypeId]);

  useEffect(() => {
    if (!selectedMove) {
      setJobDayId("");
      return;
    }
    const days = activeJobDaysForMove(selectedMove);
    setJobDayId(days[0]?.id ?? "");
    if (days[0]?.date) setDueDate(days[0].date);
  }, [selectedMove?.id]);

  useEffect(() => {
    if (titleManual) return;
    setTitle(defaultTitle(vendorTypeId, vendorDirectoryId));
  }, [vendorTypeId, vendorDirectoryId, titleManual]);

  useEffect(() => {
    if (
      vendorDirectoryId &&
      !vendorDirectoryOptionMatchesVendorType(vendorDirectoryId, vendorTypeId)
    ) {
      setVendorDirectoryId(vendorOptions[0]?.id ?? null);
    }
  }, [vendorTypeId, vendorDirectoryId, vendorOptions]);

  const canSave = title.trim().length > 0 && dueDate.length > 0 && vendorTypeId.length > 0;

  function handleSave() {
    if (!canSave) return;

    const jobDay = jobDays.find((day) => day.id === jobDayId);
    const vendorName = vendorDirectoryId
      ? resolveVendorDirectoryLabel(vendorDirectoryId)
      : undefined;

    addManualOpsPrepTask({
      moveId: selectedMove?.id,
      customerName: selectedMove?.customerName ?? MANUAL_OPS_PREP_NO_MOVE_LABEL,
      jobDayId: jobDay?.id,
      jobDayLabel: jobDay?.label,
      dueDate,
      vendorTypeId,
      category: opsPrepCategoryForVendorType(vendorTypeId),
      title: title.trim(),
      detail: detail.trim() || "Added from Jobs ops prep.",
      vendor: vendorName || undefined,
      vendorId: vendorDirectoryId ?? undefined,
    });
    onClose();
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Add ops prep"
      description="Schedule vendors, materials, or other prep — optionally linked to a move."
      widthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            Add prep item
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Move (optional)</span>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Search by customer, reference, or address — leave blank for general prep.
          </p>
          <MoveCalendarSearchPicker
            className="mt-1"
            selectedMoveId={selectedMove?.id}
            onSelect={setSelectedMove}
            onClear={() => setSelectedMove(null)}
            placeholder="Search moves…"
            emptyQueryHint="Active moves — search by name, reference, or address."
          />
        </label>

        {selectedMove && jobDays.length > 0 ? (
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Job day (optional)</span>
            <select
              value={jobDayId}
              onChange={(event) => {
                const nextId = event.target.value;
                setJobDayId(nextId);
                const day = jobDays.find((d) => d.id === nextId);
                if (day?.date) setDueDate(day.date);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Not tied to a day</option>
              {jobDays.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label} · {day.date}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Vendor type</span>
            <select
              value={vendorTypeId}
              onChange={(event) => {
                setVendorTypeId(event.target.value);
                setVendorDirectoryId(null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {vendorTypes.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Vendor (optional)</span>
            <select
              value={vendorDirectoryId ?? ""}
              onChange={(event) =>
                setVendorDirectoryId(event.target.value || null)
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">
                {vendorOptions.length === 0 ? "No vendors for this type" : "Select vendor…"}
              </option>
              {vendorOptions.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">Title</span>
          <input
            value={title}
            onChange={(event) => {
              setTitleManual(true);
              setTitle(event.target.value);
            }}
            placeholder="e.g. Book Shamrock crating, order bubble wrap"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600">Notes</span>
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            rows={4}
            placeholder="What to book, who to call, access details…"
            className={cn(
              "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed",
            )}
          />
        </label>
      </div>
    </DetailSidebar>
  );
}
