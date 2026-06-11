"use client";

import { RecurrencePicker } from "@/components/schedule/RecurrencePicker";
import { Button } from "@/components/ui/Button";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import type { StaffCalendarMember } from "@/lib/schedule/staff-calendar-filter";
import { newLocalStaffCalendarEvent } from "@/lib/schedule/staff-calendar-edits";
import type { StaffCalendarRecurrence } from "@/lib/schedule/recurrence";
import { timeInputValueToMinutes } from "@/lib/schedule/staff-calendar-time";
import type { StaffCalendarEvent } from "@/lib/schedule/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type StaffScheduleNewEventDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (event: StaffCalendarEvent) => void;
  defaultStaff: StaffCalendarMember;
  defaultDateKey: string;
};

export function StaffScheduleNewEventDialog({
  open,
  onClose,
  onCreate,
  defaultStaff,
  defaultDateKey,
}: StaffScheduleNewEventDialogProps) {
  const [title, setTitle] = useState("New meeting");
  const [dateKey, setDateKey] = useState(defaultDateKey);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState<StaffCalendarRecurrence | undefined>();

  useEffect(() => {
    if (!open) return;
    setDateKey(defaultDateKey);
    setRecurrence(undefined);
  }, [open, defaultDateKey]);

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

  if (!open) return null;

  function handleCreate() {
    const startMinutes = timeInputValueToMinutes(startTime);
    const endMinutes = timeInputValueToMinutes(endTime);

    onCreate(
      newLocalStaffCalendarEvent({
        title: title.trim() || "Untitled",
        dateKey,
        startMinutes,
        endMinutes: Math.max(endMinutes, startMinutes + 15),
        staffId: defaultStaff.staffId,
        staffName: defaultStaff.staffName,
        department: defaultStaff.department,
        kind: "meeting",
        location: location.trim() || undefined,
        recurrence,
        notes: "",
      }),
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Schedule event</h2>
            <p className="mt-1 text-sm text-slate-500">
              Demo scheduling — will write to Outlook when connected.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <SettingsField label="Title">
            <SettingsInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </SettingsField>
          <SettingsField label="Date">
            <SettingsInput
              type="date"
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
            />
          </SettingsField>
          <div className="grid grid-cols-2 gap-3">
            <SettingsField label="Start">
              <SettingsInput
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </SettingsField>
            <SettingsField label="End">
              <SettingsInput
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </SettingsField>
          </div>
          <SettingsField label="Location (optional)">
            <SettingsInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office, Teams, on-site…"
            />
          </SettingsField>

          <RecurrencePicker
            anchorDateKey={dateKey}
            value={recurrence}
            onChange={setRecurrence}
          />

          <p className="text-xs text-slate-500">
            For {defaultStaff.staffName}. Saves on this calendar until Outlook sync is live.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate}>
            Add to calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
