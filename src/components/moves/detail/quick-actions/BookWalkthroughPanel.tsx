"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { MoveRecord } from "@/lib/moves/types";
import { Calendar, Link2, MapPin, Video } from "lucide-react";
import { useMemo, useState } from "react";

type BookWalkthroughPanelProps = {
  move: MoveRecord;
  reps: string[];
};

type WalkthroughMode = "in_person" | "virtual";
type BookingTab = "calendar" | "link";

const SLOT_TIMES = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

function buildMockDays(anchor: Date): { date: Date; label: string; key: string }[] {
  const days: { date: Date; label: string; key: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    if (d.getDay() === 0) continue;
    days.push({
      date: d,
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    });
    if (days.length >= 8) break;
  }
  return days;
}

export function BookWalkthroughPanel({ move, reps }: BookWalkthroughPanelProps) {
  const [tab, setTab] = useState<BookingTab>("calendar");
  const [assignedRep, setAssignedRep] = useState(move.assignedRep);
  const [mode, setMode] = useState<WalkthroughMode>("in_person");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const days = useMemo(() => buildMockDays(new Date()), []);
  const schedulingLink = `https://schedule.jmmoves.example/w/${move.reference.toLowerCase()}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-4 pt-3">
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setTab("calendar")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
              tab === "calendar"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Book on calendar
          </button>
          <button
            type="button"
            onClick={() => setTab("link")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
              tab === "link"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            Send scheduling link
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "calendar" ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-700">
                {assignedRep}&apos;s availability
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Pick a day and time — defaults to sales rep on this move
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.key);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-2 text-left text-[11px] transition-colors",
                    selectedDay === day.key
                      ? "border-brand-400 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand-200",
                  )}
                >
                  <span className="block font-semibold">{day.label}</span>
                </button>
              ))}
            </div>

            {selectedDay ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Open slots
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SLOT_TIMES.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                        selectedSlot === slot
                          ? "border-brand-500 bg-brand-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center text-sm text-slate-500">
                Select a day to see open times
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send {move.customerName} a link to pick a walkthrough time. They&apos;ll choose in-person
              or virtual when booking.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase text-slate-500">Scheduling link</p>
              <p className="mt-1 break-all font-mono text-xs text-brand-700">{schedulingLink}</p>
            </div>
            <p className="text-xs text-slate-500">
              Link expires in 14 days · notifications go to {assignedRep}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-3 border-t border-slate-200 bg-white px-4 py-4">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Scheduler</span>
          <select
            value={assignedRep}
            onChange={(e) => setAssignedRep(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {reps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-xs font-medium text-slate-700">Walkthrough type</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("in_person")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors",
                mode === "in_person"
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 text-slate-600 hover:border-brand-200",
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              In person
            </button>
            <button
              type="button"
              onClick={() => setMode("virtual")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors",
                mode === "virtual"
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 text-slate-600 hover:border-brand-200",
              )}
            >
              <Video className="h-3.5 w-3.5" />
              Virtual
            </button>
          </div>
        </div>

        <Button
          type="button"
          disabled
          title="Coming soon"
          className="w-full"
        >
          {tab === "calendar"
            ? selectedDay && selectedSlot
              ? `Book ${mode === "virtual" ? "virtual" : "in-person"} walkthrough`
              : "Select day and time"
            : "Send scheduling link"}
        </Button>
      </div>
    </div>
  );
}
