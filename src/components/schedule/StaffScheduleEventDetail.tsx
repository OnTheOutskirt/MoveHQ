"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { formatEventTimeRange } from "@/lib/schedule/format-event-time";
import {
  departmentLabel,
  departmentTone,
} from "@/lib/schedule/staff-calendar-filter";
import {
  resolveStaffCalendarEventSource,
  staffCalendarEventIsEditable,
} from "@/lib/schedule/staff-calendar-edits";
import {
  resolveStaffCalendarEventKind,
  staffCalendarEventKindIcon,
  staffCalendarEventKindLabel,
} from "@/lib/schedule/staff-calendar-event-display";
import {
  minutesToTimeInputValue,
  timeInputValueToMinutes,
} from "@/lib/schedule/staff-calendar-time";
import type { StaffCalendarEvent, StaffCalendarEventPatch } from "@/lib/schedule/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { RecurrencePicker } from "@/components/schedule/RecurrencePicker";
import { normalizeRecurrence } from "@/lib/schedule/recurrence";
import type { StaffCalendarRecurrence } from "@/lib/schedule/recurrence";
import { ArrowRight, CalendarSync, ExternalLink, Repeat, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type StaffScheduleEventDetailProps = {
  event: StaffCalendarEvent | null;
  onClose: () => void;
  onSave: (eventId: string, patch: StaffCalendarEventPatch) => void;
  onRemove: (eventId: string) => void;
};

const SOURCE_LABEL = {
  outlook: "Microsoft Outlook",
  walkthrough: "MoveHQ walkthrough",
  local: "Scheduled here",
} as const;

function formatEventDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function StaffScheduleEventDetail({
  event,
  onClose,
  onSave,
  onRemove,
}: StaffScheduleEventDetailProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState<StaffCalendarRecurrence | undefined>();

  useEffect(() => {
    if (!event) {
      setEditing(false);
      return;
    }
    setTitle(event.title);
    setDateKey(event.dateKey);
    setStartTime(minutesToTimeInputValue(event.startMinutes));
    setEndTime(minutesToTimeInputValue(event.endMinutes));
    setLocation(event.location ?? "");
    setNotes(event.notes ?? "");
    setRecurrence(normalizeRecurrence(event.recurrence, event.dateKey));
    setEditing(false);
  }, [event]);

  if (!event) return null;

  const activeEvent = event;
  const kind = resolveStaffCalendarEventKind(activeEvent);
  const KindIcon = staffCalendarEventKindIcon(kind);
  const tone = departmentTone(activeEvent.department);
  const durationMin = activeEvent.endMinutes - activeEvent.startMinutes;
  const source = resolveStaffCalendarEventSource(activeEvent);
  const editable = staffCalendarEventIsEditable(activeEvent);
  const syncsToOutlook = source === "outlook" || source === "local";

  function handleSave() {
    const startMinutes = timeInputValueToMinutes(startTime);
    const endMinutes = Math.max(timeInputValueToMinutes(endTime), startMinutes + 15);
    onSave(activeEvent.id, {
      title: title.trim() || activeEvent.title,
      dateKey,
      startMinutes,
      endMinutes,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      recurrence,
    });
    setEditing(false);
  }

  return (
    <DetailSidebar
      open={event != null}
      onClose={onClose}
      title={editing ? "Edit event" : activeEvent.title}
      description={
        editing
          ? "Changes save on this calendar — will sync to Outlook when connected."
          : `${formatEventDate(activeEvent.dateKey)} · ${formatEventTimeRange(activeEvent.startMinutes, activeEvent.endMinutes)} (${durationMin} min)`
      }
      widthClassName="max-w-lg"
      headerBelow={
        <>
          <Badge className={cn("gap-1", tone.bg, tone.text)}>
            <KindIcon className="h-3 w-3" aria-hidden />
            {staffCalendarEventKindLabel(kind)}
          </Badge>
          <Badge variant="default">{departmentLabel(activeEvent.department)}</Badge>
          <Badge variant={source === "outlook" ? "brand" : "default"}>
            {SOURCE_LABEL[source]}
          </Badge>
        </>
      }
      footer={
        editable ? (
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save changes
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={() => setEditing(true)}>
                  Reschedule / edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-red-700 hover:bg-red-50"
                  onClick={() => {
                    onRemove(activeEvent.id);
                    onClose();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </>
            )}
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-start gap-2">
            <CalendarSync className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-slate-900">
                {syncsToOutlook ? "Two-way Outlook sync (planned)" : "MoveHQ booking"}
              </p>
              <p className="mt-1 text-slate-600">
                {source === "walkthrough"
                  ? "Walkthroughs are booked on the move. Reschedule from the move or Walkthroughs screen — we can mirror to Outlook when connected."
                  : syncsToOutlook
                    ? "Edits here will PATCH the rep's Outlook calendar via Microsoft Graph. New and recurring events use Graph recurrence rules."
                    : "This event only lives in MoveHQ for now."}
              </p>
            </div>
          </div>
        </section>

        {editing ? (
          <section className="space-y-3">
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
            <SettingsField label="Location">
              <SettingsInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Optional"
              />
            </SettingsField>
            <RecurrencePicker
              anchorDateKey={dateKey}
              value={recurrence}
              onChange={setRecurrence}
            />
          </section>
        ) : (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Assigned to
              </dt>
              <dd className="mt-1 font-medium text-slate-900">{activeEvent.staffName}</dd>
            </div>
            {activeEvent.location ? (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </dt>
                <dd className="mt-1 text-slate-800">{activeEvent.location}</dd>
              </div>
            ) : null}
            {recurrence ? (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Repeats
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-slate-800">
                  <Repeat className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  {recurrence.label}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        <section>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (!editing && notes !== (activeEvent.notes ?? "")) {
                onSave(activeEvent.id, { notes: notes.trim() || undefined });
              }
            }}
            disabled={!editable}
            placeholder={editable ? "Internal notes for this block…" : "Notes on the linked move"}
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50"
          />
        </section>

        {activeEvent.moveId ? (
          <section className="border-t border-slate-100 pt-4">
            <Link
              href={salesMovePath(activeEvent.moveId)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Open move
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={salesMovePath(activeEvent.moveId)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              New tab
              <ExternalLink className="h-3 w-3" />
            </a>
          </section>
        ) : syncsToOutlook ? (
          <p className="text-xs text-slate-500">
            When Outlook is connected, an &ldquo;Open in Outlook&rdquo; link will appear here for
            this event.
          </p>
        ) : null}
      </div>
    </DetailSidebar>
  );
}
