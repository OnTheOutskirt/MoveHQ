"use client";

import { Button } from "@/components/ui/Button";
import {
  activeOfficeElapsedMs,
  canUseOfficeTimeClock,
  clockInOffice,
  clockOutOffice,
  endOfficeBreak,
  formatOfficeClockDuration,
  officeClockStatusLabel,
  readOfficeClock,
  startOfficeBreak,
  subscribeOfficeClock,
  type OfficeClockState,
} from "@/lib/payroll/office-time-clock-storage";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import { useSession } from "@/components/providers/SessionProvider";
import { toDateKey } from "@/lib/calendar/date-utils";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { cn } from "@/lib/utils";
import { Coffee, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function OfficeTimeClockMenu() {
  const { user } = useSession();
  const { can } = useCapabilities();
  const clientReady = useClientReady();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<OfficeClockState>(() =>
    readOfficeClock(toDateKey(new Date()), user.id),
  );

  useEffect(() => {
    if (!clientReady) return;
    setState(readOfficeClock(toDateKey(new Date()), user.id));
    return subscribeOfficeClock(() => setState(readOfficeClock(toDateKey(new Date()), user.id)));
  }, [clientReady, user.id]);

  useEffect(() => {
    if (!clientReady || state.phase === "out") return;
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, [clientReady, state.phase]);

  if (!clientReady || !canUseOfficeTimeClock(user.id)) return null;

  void tick;
  const todayKey = toDateKey(new Date());
  const onClock = state.phase === "in" || state.phase === "break";
  const onBreak = state.phase === "break";
  const status = officeClockStatusLabel(state);

  function refresh() {
    setState(readOfficeClock(todayKey, user.id));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-slate-500 hover:bg-slate-100 sm:px-2.5",
          onClock && "text-emerald-700 hover:bg-emerald-50",
          onClock && "ring-2 ring-emerald-400/40 ring-offset-1",
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={onClock ? `Time clock — ${status}` : "Office time clock"}
        title={status}
      >
        <Timer className={cn("h-4 w-4", onClock && "text-emerald-600")} />
        {onClock ? (
          <span className="hidden max-w-[5.5rem] truncate text-xs font-semibold tabular-nums sm:inline">
            {formatOfficeClockDuration(activeOfficeElapsedMs(state))}
          </span>
        ) : null}
        {onClock ? (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white",
              onBreak ? "bg-amber-500" : "bg-emerald-500",
            )}
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close time clock"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Office time clock</p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  onClock ? "font-medium text-emerald-800" : "text-slate-500",
                )}
              >
                {status}
              </p>
            </div>

            <div className="space-y-2 px-4 py-3">
              {state.phase === "out" ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    clockInOffice(todayKey, user.id);
                    refresh();
                  }}
                >
                  Clock in
                </Button>
              ) : null}

              {state.phase === "in" ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      startOfficeBreak(todayKey, user.id);
                      refresh();
                    }}
                  >
                    <Coffee className="h-4 w-4" />
                    Start break
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full border-red-200 text-red-800 hover:bg-red-50"
                    onClick={() => {
                      clockOutOffice(todayKey, user.id);
                      refresh();
                    }}
                  >
                    Clock out
                  </Button>
                </>
              ) : null}

              {state.phase === "break" ? (
                <>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      endOfficeBreak(todayKey, user.id);
                      refresh();
                    }}
                  >
                    End break
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full border-red-200 text-red-800 hover:bg-red-50"
                    onClick={() => {
                      clockOutOffice(todayKey, user.id);
                      refresh();
                    }}
                  >
                    Clock out
                  </Button>
                </>
              ) : null}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <p className="text-[11px] leading-snug text-slate-500">
                Office hours only — not move/drive time. Approved entries show in Payroll &amp;
                Time.
              </p>
              {can("nav.payroll") ? (
                <Link
                  href="/operations/payroll"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-block text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Payroll &amp; Time →
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
