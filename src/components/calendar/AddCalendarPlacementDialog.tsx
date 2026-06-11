"use client";

import { MoveCalendarSearchPicker } from "@/components/calendar/MoveCalendarSearchPicker";
import { useCalendarPlacements } from "@/components/providers/CalendarPlacementProvider";
import { Button } from "@/components/ui/Button";
import { formatDayLong, toDateKey } from "@/lib/calendar/date-utils";
import {
  buildHoldDayDrafts,
  defaultWaitlistCapacity,
  hasPlacement,
  validateHoldDrafts,
} from "@/lib/calendar/placement";
import type { CalendarPlacementKind, HoldDayDraft } from "@/lib/calendar/placement-types";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import { useEffect, useMemo, useState } from "react";

type AddCalendarPlacementDialogProps = {
  open: boolean;
  kind: CalendarPlacementKind;
  /** Selected calendar day — required for waitlist from calendar; optional context for hold. */
  anchorDate?: Date | null;
  /** Pre-selected move when opened from move detail. */
  presetMove?: MoveRecord;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AddCalendarPlacementDialog({
  open,
  kind,
  anchorDate,
  presetMove,
  onClose,
  onSuccess,
}: AddCalendarPlacementDialogProps) {
  const { store, placeOnHold, placeOnWaitlist } = useCalendarPlacements();
  const [selectedMove, setSelectedMove] = useState<MoveRecord | undefined>(presetMove);
  const [holdDrafts, setHoldDrafts] = useState<HoldDayDraft[]>([]);
  const [waitlistDate, setWaitlistDate] = useState("");
  const [waitlistMovers, setWaitlistMovers] = useState(4);
  const [waitlistTrucks, setWaitlistTrucks] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const anchorDateKey = anchorDate ? toDateKey(anchorDate) : "";

  useEffect(() => {
    if (!open) return;
    setSelectedMove(presetMove);
    setError(null);
    if (presetMove) {
      if (kind === "hold") {
        setHoldDrafts(buildHoldDayDrafts(presetMove));
      } else {
        const date =
          anchorDateKey ||
          presetMove.jobDays[0]?.date ||
          presetMove.preferredDate;
        const caps = defaultWaitlistCapacity(presetMove, date);
        setWaitlistDate(date);
        setWaitlistMovers(caps.movers);
        setWaitlistTrucks(caps.trucks);
      }
    } else {
      setHoldDrafts([]);
      setWaitlistDate(anchorDateKey);
      setWaitlistMovers(4);
      setWaitlistTrucks(1);
    }
  }, [open, presetMove, kind, anchorDateKey]);

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

  const waitlistDateOptions = useMemo(() => {
    if (!selectedMove) return [];
    const dates = new Set<string>();
    for (const day of selectedMove.jobDays) dates.add(day.date);
    if (selectedMove.preferredDate) dates.add(selectedMove.preferredDate);
    if (anchorDateKey) dates.add(anchorDateKey);
    return [...dates].sort();
  }, [selectedMove, anchorDateKey]);

  function handleMoveSelect(move: MoveRecord) {
    setSelectedMove(move);
    setError(null);
    if (kind === "hold") {
      setHoldDrafts(buildHoldDayDrafts(move));
    } else {
      const date =
        anchorDateKey || move.jobDays[0]?.date || move.preferredDate;
      const caps = defaultWaitlistCapacity(move, date);
      setWaitlistDate(date);
      setWaitlistMovers(caps.movers);
      setWaitlistTrucks(caps.trucks);
    }
  }

  function updateHoldDraft(index: number, patch: Partial<HoldDayDraft>) {
    setHoldDrafts((prev) =>
      prev.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)),
    );
  }

  function handleWaitlistDateChange(date: string) {
    setWaitlistDate(date);
    if (selectedMove) {
      const caps = defaultWaitlistCapacity(selectedMove, date);
      setWaitlistMovers(caps.movers);
      setWaitlistTrucks(caps.trucks);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedMove) {
      setError("Select a move to continue.");
      return;
    }

    if (kind === "hold") {
      const validationError = validateHoldDrafts(holdDrafts);
      if (validationError) {
        setError(validationError);
        return;
      }
      const alreadyOnHold = holdDrafts.some((draft) =>
        hasPlacement(store, selectedMove.id, draft.date, "hold"),
      );
      if (alreadyOnHold) {
        setError("This move is already on hold for one or more of these days.");
        return;
      }
      placeOnHold(selectedMove, holdDrafts);
    } else {
      if (!waitlistDate) {
        setError("Choose a waitlist date.");
        return;
      }
      if (hasPlacement(store, selectedMove.id, waitlistDate, "waitlist")) {
        setError("This move is already on the waitlist for that day.");
        return;
      }
      placeOnWaitlist(selectedMove, waitlistDate, waitlistMovers, waitlistTrucks);
    }

    onSuccess?.();
    onClose();
  }

  if (!open) return null;

  const title = kind === "hold" ? "Add to hold" : "Add to waitlist";
  const description =
    kind === "hold"
      ? anchorDate
        ? `Reserve movers and trucks on every scheduled job day. Hold applies across all days — not just ${formatDayLong(anchorDate)}.`
        : "Reserve movers and trucks on every scheduled job day for this move."
      : anchorDate
        ? `Add a move to the waitlist for ${formatDayLong(anchorDate)}.`
        : "Add this move to the waitlist for a specific day.";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-placement-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="overflow-y-auto p-6">
          <h2 id="add-placement-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>

          {!presetMove ? (
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">Move</label>
              <MoveCalendarSearchPicker
                className="mt-1"
                selectedMoveId={selectedMove?.id}
                onSelect={handleMoveSelect}
                onClear={() => setSelectedMove(undefined)}
              />
            </div>
          ) : null}

          {kind === "hold" && selectedMove ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600">
                Capacity to hold ({holdDrafts.length} job{" "}
                {holdDrafts.length === 1 ? "day" : "days"})
              </p>
              <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1.5">Day</th>
                      <th className="px-2 py-1.5 text-right">Movers</th>
                      <th className="px-2 py-1.5 text-right">Trucks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {holdDrafts.map((draft, index) => (
                      <tr key={`${draft.date}-${draft.jobDayId ?? index}`}>
                        <td className="px-2 py-2">
                          <p className="font-medium text-slate-900">{draft.label}</p>
                          <p className="text-[11px] text-slate-500">{formatMoveDate(draft.date)}</p>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={1}
                            required
                            value={draft.movers}
                            onChange={(e) =>
                              updateHoldDraft(index, {
                                movers: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-right text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min={1}
                            required
                            value={draft.trucks}
                            onChange={(e) =>
                              updateHoldDraft(index, {
                                trucks: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-right text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {kind === "waitlist" && selectedMove ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Waitlist date</label>
                {waitlistDateOptions.length > 0 ? (
                  <select
                    value={waitlistDate}
                    onChange={(e) => handleWaitlistDateChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {waitlistDateOptions.map((date) => (
                      <option key={date} value={date}>
                        {formatMoveDate(date)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    required
                    value={waitlistDate}
                    onChange={(e) => handleWaitlistDateChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Movers</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={waitlistMovers}
                    onChange={(e) => setWaitlistMovers(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Trucks</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={waitlistTrucks}
                    onChange={(e) => setWaitlistTrucks(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedMove}>
            {kind === "hold" ? "Place on hold" : "Add to waitlist"}
          </Button>
        </div>
      </form>
    </div>
  );
}
