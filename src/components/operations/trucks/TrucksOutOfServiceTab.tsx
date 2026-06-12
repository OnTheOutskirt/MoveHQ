"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatTruckInline } from "@/lib/operations/fleet";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function TrucksOutOfServiceTab() {
  const { trucks, truckOutages, addTruckOutage, removeTruckOutage } = useFleet();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Block trucks from dispatch when they are in the shop, on rental return, or otherwise
          unavailable. Multiple date ranges per truck are supported.
        </p>
        <Button type="button" size="sm" onClick={() => setSidebarOpen(true)}>
          <CalendarOff className="h-4 w-4" />
          Mark out of service
        </Button>
      </div>

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

      <DetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="Out of service"
        description="Schedule when a truck should be hidden from dispatch."
        widthClassName="max-w-md"
      >
        <OutOfServiceForm
          trucks={trucks}
          onCancel={() => setSidebarOpen(false)}
          onSave={(data) => {
            addTruckOutage(data);
            setSidebarOpen(false);
          }}
        />
      </DetailSidebar>
    </>
  );
}

function OutOfServiceForm({
  trucks,
  onSave,
  onCancel,
}: {
  trucks: ReturnType<typeof useFleet>["trucks"];
  onSave: (data: { truckId: string; startDate: string; endDate: string; reason: string }) => void;
  onCancel: () => void;
}) {
  const [truckId, setTruckId] = useState(trucks[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!truckId || !startDate || !reason.trim()) return;
        onSave({
          truckId,
          startDate,
          endDate: endDate || startDate,
          reason: reason.trim(),
        });
      }}
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Truck
        </label>
        <select
          value={truckId}
          onChange={(e) => setTruckId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        >
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {formatTruckInline(t)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Start
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            End
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reason
        </label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Body shop, engine repair…"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus className="h-4 w-4" />
          Add period
        </Button>
      </div>
    </form>
  );
}
