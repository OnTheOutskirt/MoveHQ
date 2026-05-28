"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { formatTruckInline } from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function TrucksOutOfServiceTab() {
  const { trucks, truckOutages, addTruckOutage, removeTruckOutage } = useFleet();
  const [truckId, setTruckId] = useState(trucks[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const forTruck = truckOutages.filter((o) => o.truckId === truckId);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!truckId || !startDate || !reason.trim()) return;
    addTruckOutage({
      truckId,
      startDate,
      endDate: endDate || startDate,
      reason: reason.trim(),
    });
    setStartDate("");
    setEndDate("");
    setReason("");
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Schedule when a truck is out of service (repairs, rental return, etc.). Multiple blocks per
        truck are supported. Dispatch can use this later to hide unavailable units.
      </p>

      <form
        onSubmit={handleAdd}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarOff className="h-4 w-4 text-slate-500" />
          Add out-of-service period
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-500">Truck</label>
            <select
              value={truckId}
              onChange={(e) => setTruckId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatTruckInline(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold uppercase text-slate-500">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Body shop, engine repair…"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>
        <Button type="submit" size="sm" className="mt-4">
          <Plus className="h-4 w-4" />
          Add period
        </Button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Scheduled outages</h3>
        </div>
        {truckOutages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No outages scheduled.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {truckOutages.map((o) => {
              const truck = trucks.find((t) => t.id === o.truckId);
              return (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {truck ? formatTruckInline(truck) : o.truckId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.startDate}
                      {o.endDate !== o.startDate ? ` → ${o.endDate}` : ""} · {o.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTruckOutage(o.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove outage"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {truckId && forTruck.length > 0 ? (
        <p className="text-xs text-slate-500">
          Selected truck has {forTruck.length} outage block{forTruck.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
