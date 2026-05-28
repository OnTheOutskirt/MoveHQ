"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { toDateKey } from "@/lib/calendar/date-utils";
import {
  CAB_SIZES,
  formatTruckVehicleType,
  RENTAL_VENDORS,
  rentalScheduleStatus,
  TRUCK_VEHICLE_TYPES,
  truckSupportsLiftgate,
  truckSupportsLength,
  type RentalVendor,
  type TemporaryTruckFormInput,
  type TemporaryTruckRental,
  type TruckVehicleType,
} from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "edit"; id: string } | { type: "add" };

const STATUS_LABELS = {
  active: "Active",
  upcoming: "Upcoming",
  ended: "Ended",
} as const;

function formatDateRange(start: string, end: string): string {
  return start === end ? start : `${start} → ${end}`;
}

function formatLength(lengthFt?: string): string {
  if (!lengthFt?.trim()) return "—";
  return `${lengthFt.trim()} ft`;
}

export function TrucksRentalsTab() {
  const {
    temporaryRentals,
    addTemporaryRental,
    updateTemporaryRental,
    removeTemporaryRental,
  } = useFleet();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  const editing =
    panel.type === "edit" ? temporaryRentals.find((r) => r.id === panel.id) : undefined;

  const sortedRentals = useMemo(
    () =>
      [...temporaryRentals].sort((a, b) => {
        const aStatus = rentalScheduleStatus(a, todayKey);
        const bStatus = rentalScheduleStatus(b, todayKey);
        const order = { active: 0, upcoming: 1, ended: 2 };
        if (order[aStatus] !== order[bStatus]) return order[aStatus] - order[bStatus];
        return a.startDate.localeCompare(b.startDate);
      }),
    [temporaryRentals, todayKey],
  );

  const columns = useMemo<Column<TemporaryTruckRental>[]>(
    () => [
      {
        key: "label",
        header: "Label",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.label}</p>
            <p className="text-[11px] text-slate-500">{row.vendor}</p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (row) => formatTruckVehicleType(row.vehicleType),
      },
      {
        key: "length",
        header: "Length",
        cell: (row) => formatLength(row.lengthFt),
      },
      {
        key: "dates",
        header: "Dates",
        cell: (row) => (
          <span className="text-slate-800">{formatDateRange(row.startDate, row.endDate)}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => {
          const status = rentalScheduleStatus(row, todayKey);
          return (
            <Badge
              variant={
                status === "active" ? "brand" : status === "upcoming" ? "default" : "default"
              }
              className={cn(status === "ended" && "bg-slate-100 text-slate-500")}
            >
              {STATUS_LABELS[status]}
            </Badge>
          );
        },
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPanel({ type: "edit", id: row.id });
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label={`Edit ${row.label}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [todayKey],
  );

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate-600">
            Short-term rentals (U-Haul, Penske, etc.) add to truck capacity on the calendar for
            their date range and appear in dispatch on those days.
          </p>
          <Button type="button" size="sm" onClick={() => setPanel({ type: "add" })}>
            <Plus className="h-4 w-4" />
            Add rental
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={sortedRentals}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setPanel({ type: "edit", id: r.id })}
          emptyMessage="No temporary rentals scheduled."
        />
      </div>

      <DetailSidebar
        open={panel.type !== "closed"}
        onClose={() => setPanel({ type: "closed" })}
        title={panel.type === "add" ? "Add rental truck" : editing?.label ?? "Rental truck"}
        widthClassName="max-w-md"
      >
        {panel.type === "add" ? (
          <RentalForm
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              addTemporaryRental(data);
              setPanel({ type: "closed" });
            }}
          />
        ) : editing ? (
          <RentalForm
            initial={editing}
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              updateTemporaryRental(editing.id, data);
              setPanel({ type: "closed" });
            }}
            onDelete={() => setDeleteId(editing.id)}
          />
        ) : null}
      </DetailSidebar>

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="Remove rental?"
        description="This rental will no longer count toward calendar capacity or dispatch."
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteId) removeTemporaryRental(deleteId);
          setDeleteId(null);
          setPanel({ type: "closed" });
        }}
      />
    </>
  );
}

function RentalForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: TemporaryTruckRental;
  onSave: (data: TemporaryTruckFormInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [vendor, setVendor] = useState<RentalVendor>(initial?.vendor ?? "U-Haul");
  const [vehicleType, setVehicleType] = useState<TruckVehicleType>(
    initial?.vehicleType ?? "rental_truck",
  );
  const [lengthFt, setLengthFt] = useState(initial?.lengthFt ?? "");
  const [cabSize, setCabSize] = useState<number | "">(initial?.cabSize ?? 2);
  const [hasLiftgate, setHasLiftgate] = useState(initial?.hasLiftgate ?? false);
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const showLength = truckSupportsLength(vehicleType);
  const showLiftgate = truckSupportsLiftgate(vehicleType);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim() || !startDate || !endDate) return;
        onSave({
          label: label.trim(),
          vendor,
          vehicleType,
          lengthFt: showLength ? lengthFt.trim() || undefined : undefined,
          cabSize: cabSize === "" ? undefined : cabSize,
          hasLiftgate: showLiftgate ? hasLiftgate : undefined,
          startDate,
          endDate: endDate || startDate,
          notes: notes.trim() || undefined,
        });
      }}
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Truck label
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="U-Haul 26ft"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vendor
        </label>
        <select
          value={vendor}
          onChange={(e) => setVendor(e.target.value as RentalVendor)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {RENTAL_VENDORS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Truck type
        </label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value as TruckVehicleType)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {TRUCK_VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatTruckVehicleType(t)}
            </option>
          ))}
        </select>
      </div>

      {showLength ? (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Length (ft)
          </label>
          <div className="relative mt-1">
            <input
              value={lengthFt}
              onChange={(e) => setLengthFt(e.target.value)}
              placeholder="26"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ft
            </span>
          </div>
        </div>
      ) : null}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cab size
        </label>
        <select
          value={cabSize}
          onChange={(e) => setCabSize(e.target.value ? Number(e.target.value) : "")}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Not set</option>
          {CAB_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} people
            </option>
          ))}
        </select>
      </div>

      {showLiftgate ? (
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={hasLiftgate}
            onChange={(e) => setHasLiftgate(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Has liftgate
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Start date
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
            End date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Return time, confirmation #, etc."
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete ? (
          <Button type="button" variant="secondary" onClick={onDelete} className="ml-auto text-red-700">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
    </form>
  );
}
