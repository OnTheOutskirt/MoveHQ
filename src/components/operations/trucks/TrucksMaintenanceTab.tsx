"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  formatTruckInline,
  type MaintenanceStatus,
  type TruckMaintenanceRecord,
} from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_STYLES: Record<TruckMaintenanceRecord["status"], string> = {
  scheduled: "bg-sky-100 text-sky-900",
  completed: "bg-emerald-100 text-emerald-900",
  overdue: "bg-red-100 text-red-900",
};

const MAINTENANCE_TYPES = ["Oil change", "DOT inspection", "Brakes", "Tires", "Other"];

export function TrucksMaintenanceTab() {
  const { maintenance, trucks, addMaintenance, removeMaintenance } = useFleet();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const columns = useMemo<Column<TruckMaintenanceRecord>[]>(
    () => [
      {
        key: "truck",
        header: "Truck",
        cell: (row) => {
          const truck = trucks.find((t) => t.id === row.truckId);
          return truck ? formatTruckInline(truck) : row.truckId;
        },
      },
      {
        key: "title",
        header: "Work",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500">{row.type}</p>
          </div>
        ),
      },
      {
        key: "date",
        header: "Scheduled",
        cell: (row) => row.scheduledDate,
      },
      {
        key: "mileage",
        header: "Mileage",
        cell: (row) => (row.mileage != null ? row.mileage.toLocaleString() : "—"),
      },
      {
        key: "vendor",
        header: "Vendor",
        cell: (row) => row.vendor ?? "—",
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
              STATUS_STYLES[row.status],
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeMaintenance(row.id);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove maintenance record"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [trucks, removeMaintenance],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Track shop work and inspections. Dispatch can hide trucks when maintenance is overdue.
        </p>
        <Button type="button" size="sm" onClick={() => setSidebarOpen(true)}>
          <Wrench className="h-4 w-4" />
          Schedule maintenance
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={maintenance}
        getRowKey={(r) => r.id}
        emptyMessage="No maintenance records."
      />

      <DetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="Schedule maintenance"
        description="Log upcoming or completed shop work for a truck."
        widthClassName="max-w-md"
      >
        <MaintenanceForm
          trucks={trucks}
          onCancel={() => setSidebarOpen(false)}
          onSave={(data) => {
            addMaintenance(data);
            setSidebarOpen(false);
          }}
        />
      </DetailSidebar>
    </>
  );
}

function MaintenanceForm({
  trucks,
  onSave,
  onCancel,
}: {
  trucks: { id: string; label: string }[];
  onSave: (data: Omit<TruckMaintenanceRecord, "id">) => void;
  onCancel: () => void;
}) {
  const [truckId, setTruckId] = useState(trucks[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState(MAINTENANCE_TYPES[0]!);
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("scheduled");
  const [mileage, setMileage] = useState("");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!truckId || !title.trim() || !scheduledDate) return;
        onSave({
          truckId,
          title: title.trim(),
          type,
          scheduledDate,
          status,
          mileage: mileage.trim() ? Number.parseInt(mileage, 10) : undefined,
          vendor: vendor.trim() || undefined,
          notes: notes.trim() || undefined,
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
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Work title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Annual DOT inspection"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scheduled date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mileage
          </label>
          <input
            value={mileage}
            onChange={(e) => setMileage(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="142500"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vendor / shop
        </label>
        <input
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="Fleet shop, Penske, etc."
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus className="h-4 w-4" />
          Save
        </Button>
      </div>
    </form>
  );
}
