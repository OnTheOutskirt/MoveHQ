"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  CAB_SIZES,
  formatTruckVehicleType,
  TRUCK_VEHICLE_TYPES,
  truckSupportsLiftgate,
  truckSupportsLength,
  type FleetTruck,
  type TruckFormInput,
  type TruckVehicleType,
} from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "edit"; id: string } | { type: "add" };

function formatLength(lengthFt?: string): string {
  if (!lengthFt?.trim()) return "—";
  return `${lengthFt.trim()} ft`;
}

function formatLiftgate(truck: FleetTruck): string {
  if (!truckSupportsLiftgate(truck.vehicleType)) return "—";
  return truck.hasLiftgate ? "Yes" : "No";
}

export function TrucksListTab() {
  const { trucks, addTruck, updateTruck } = useFleet();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });
  const editing = panel.type === "edit" ? trucks.find((t) => t.id === panel.id) : undefined;

  const columns = useMemo<Column<FleetTruck>[]>(
    () => [
      {
        key: "label",
        header: "Label",
        cell: (row) => <span className="font-medium text-slate-900">{row.label}</span>,
      },
      {
        key: "vehicleType",
        header: "Type",
        cell: (row) => formatTruckVehicleType(row.vehicleType),
      },
      {
        key: "length",
        header: "Length",
        cell: (row) => formatLength(row.lengthFt),
      },
      {
        key: "cabSize",
        header: "Cab",
        cell: (row) =>
          row.cabSize ? `${row.cabSize} ${row.cabSize === 1 ? "person" : "people"}` : "—",
      },
      {
        key: "liftgate",
        header: "Liftgate",
        cell: (row) => formatLiftgate(row),
      },
      {
        key: "status",
        header: "Roster",
        cell: (row) => (
          <span
            className={cn(
              "text-xs font-medium",
              row.active ? "text-emerald-700" : "text-slate-400",
            )}
          >
            {row.active ? "Active" : "Inactive"}
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
    [],
  );

  return (
    <>
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={() => setPanel({ type: "add" })}>
          <Plus className="h-4 w-4" />
          Add truck
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={trucks}
        getRowKey={(t) => t.id}
        onRowClick={(t) => setPanel({ type: "edit", id: t.id })}
        emptyMessage="No trucks on the roster."
      />

      <DetailSidebar
        open={panel.type !== "closed"}
        onClose={() => setPanel({ type: "closed" })}
        title={panel.type === "add" ? "Add truck" : editing?.label ?? "Truck"}
        widthClassName="max-w-md"
      >
        {panel.type === "add" ? (
          <TruckForm
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              addTruck(data);
              setPanel({ type: "closed" });
            }}
          />
        ) : editing ? (
          <TruckForm
            initial={editing}
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              updateTruck(editing.id, data);
              setPanel({ type: "closed" });
            }}
          />
        ) : null}
      </DetailSidebar>
    </>
  );
}

function TruckForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FleetTruck;
  onSave: (data: TruckFormInput) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [vehicleType, setVehicleType] = useState<TruckVehicleType>(
    initial?.vehicleType ?? "box_truck",
  );
  const [lengthFt, setLengthFt] = useState(initial?.lengthFt ?? "");
  const [cabSize, setCabSize] = useState<number | "">(initial?.cabSize ?? 3);
  const [hasLiftgate, setHasLiftgate] = useState(initial?.hasLiftgate ?? true);
  const [active, setActive] = useState(initial?.active ?? true);
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState(initial?.year != null ? String(initial.year) : "");
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [plate, setPlate] = useState(initial?.plate ?? "");

  const showLength = truckSupportsLength(vehicleType);
  const showLiftgate = truckSupportsLiftgate(vehicleType);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSave({
          label: label.trim(),
          vehicleType,
          lengthFt: showLength ? lengthFt.trim() || undefined : undefined,
          cabSize: cabSize === "" ? undefined : cabSize,
          hasLiftgate: showLiftgate ? hasLiftgate : undefined,
          active,
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          year: year.trim() ? Number.parseInt(year, 10) : undefined,
          vin: vin.trim() || undefined,
          plate: plate.trim() || undefined,
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
          placeholder="Truck 10"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
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
              inputMode="decimal"
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

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Vehicle details
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Make
            </label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Freightliner"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Model
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="M2 106"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Year
            </label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              placeholder="2019"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plate
            </label>
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC 1234"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              VIN
            </label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="17-character VIN"
              maxLength={17}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm uppercase"
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-800">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Active on roster
      </label>

      <p className="text-xs text-slate-500">
        Inactive trucks are hidden from dispatch assignment.
      </p>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
