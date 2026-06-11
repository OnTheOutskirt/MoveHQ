"use client";

import { useMovesActions } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord, WalkthroughMode } from "@/lib/moves/types";
import {
  availableSlotsForDay,
  buildWalkthroughDayOptions,
} from "@/lib/moves/walkthrough-availability";
import {
  WALKTHROUGH_LINK_EXPIRY_DAYS,
  type WalkthroughLinkMode,
} from "@/lib/moves/walkthrough-scheduling-link";
import { walkthroughDayOneOriginAddress } from "@/lib/moves/walkthroughs";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Mail, MapPin, Phone, User, Video } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type WalkthroughSchedulingPortalProps = {
  move: MoveRecord;
  assignee: string;
  linkMode: WalkthroughLinkMode;
  companyName: string;
  logoDataUrl: string | null;
  accentColor: string;
  companyPhone?: string;
};

function resolvedBookingMode(linkMode: WalkthroughLinkMode): WalkthroughMode {
  return linkMode === "customer_choice" ? "in_person" : linkMode;
}

export function WalkthroughSchedulingPortal({
  move,
  assignee,
  linkMode,
  companyName,
  logoDataUrl,
  accentColor,
  companyPhone,
}: WalkthroughSchedulingPortalProps) {
  const { scheduleWalkthrough } = useMovesActions();
  const [mode, setMode] = useState<WalkthroughMode>(() => resolvedBookingMode(linkMode));
  const startingAddress = useMemo(() => walkthroughDayOneOriginAddress(move), [move]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const days = useMemo(() => buildWalkthroughDayOptions(new Date()), []);
  const slots = useMemo(
    () => (selectedDay ? availableSlotsForDay(assignee, selectedDay, mode) : []),
    [assignee, selectedDay, mode],
  );

  const location =
    mode === "virtual"
      ? "Video call — link sent after booking"
      : startingAddress;

  function handleBook() {
    if (!selectedDay || !selectedSlot) return;
    scheduleWalkthrough(
      move.id,
      {
        scheduledDate: selectedDay,
        startTime: selectedSlot,
        assignedTo: assignee,
        mode,
      },
      `${move.customerName} (scheduling link)`,
    );
    setBooked(true);
  }

  if (booked && selectedDay && selectedSlot) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
        <header
          className="px-6 py-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-200" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">You&apos;re booked</h1>
          <p className="mt-2 text-sm text-white/85">
            {mode === "virtual" ? "Virtual" : "In-person"} walkthrough with {assignee}
          </p>
        </header>
        <div className="space-y-4 px-5 py-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm">
            <p className="font-semibold text-slate-900">
              {formatMoveDate(selectedDay)} at {selectedSlot}
            </p>
            <p className="mt-1 text-slate-600">{location}</p>
            <p className="mt-2 text-xs text-slate-500">
              {move.reference} · {move.customerName}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {assignee} will confirm by text or email. Need to change your time? Reply to your
            confirmation message or call {companyPhone || companyName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
      <header
        className="px-6 py-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/95 p-1">
              <Image src={logoDataUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {companyName}
            </p>
            <h1 className="text-lg font-bold tracking-tight">Schedule your walkthrough</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/85">
          Hi {move.customerName.split("(")[0]?.trim() || move.customerName} — pick a time with{" "}
          <strong>{assignee}</strong> for your move estimate.
        </p>
      </header>

      <div className="space-y-5 px-5 py-6">
        <section className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Your move
          </p>
          <p className="mt-1 font-medium text-slate-900">{move.reference}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{move.customerName}</span>
            </li>
            {move.customerPhone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a href={`tel:${move.customerPhone}`} className="hover:underline">
                  {move.customerPhone}
                </a>
              </li>
            ) : null}
            {move.customerEmail ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <a href={`mailto:${move.customerEmail}`} className="break-all hover:underline">
                  {move.customerEmail}
                </a>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <span className="block text-[11px] font-medium text-slate-500">
                  Starting address (Day 1)
                </span>
                {startingAddress}
              </span>
            </li>
          </ul>
        </section>

        {linkMode === "customer_choice" ? (
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
                    : "border-slate-200 text-slate-600",
                )}
                style={
                  mode === "in_person"
                    ? { borderColor: accentColor, color: accentColor }
                    : undefined
                }
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
                    : "border-slate-200 text-slate-600",
                )}
                style={
                  mode === "virtual"
                    ? { borderColor: accentColor, color: accentColor }
                    : undefined
                }
              >
                <Video className="h-3.5 w-3.5" />
                Virtual
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            {linkMode === "virtual" ? (
              <Video className="h-4 w-4 shrink-0 text-slate-500" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
            )}
            <span>
              <span className="text-[11px] font-medium text-slate-500">Walkthrough type</span>
              <span className="block font-medium text-slate-900">
                {linkMode === "virtual" ? "Virtual" : "In person"}
              </span>
            </span>
          </div>
        )}

        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Calendar className="h-3.5 w-3.5" />
            {assignee}&apos;s availability
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
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
                    : "border-slate-200 bg-white text-slate-700",
                )}
              >
                <span className="block font-semibold">{day.label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedDay ? (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Open times
            </p>
            {slots.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                No open slots this day — try another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                      selectedSlot === slot
                        ? "text-white"
                        : "border-slate-200 bg-white text-slate-700",
                    )}
                    style={
                      selectedSlot === slot
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : undefined
                    }
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!selectedDay || !selectedSlot}
          className="w-full"
          onClick={handleBook}
          style={
            selectedDay && selectedSlot
              ? { backgroundColor: accentColor }
              : undefined
          }
        >
          Confirm walkthrough
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          Times reflect {assignee}&apos;s walkthrough availability
          {mode === "virtual" ? " (virtual)" : " (in person)"}. Outlook busy blocks when calendar
          sync is on. Link valid {WALKTHROUGH_LINK_EXPIRY_DAYS} days.
        </p>
      </div>
    </div>
  );
}
