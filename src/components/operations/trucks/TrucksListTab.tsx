"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  formatTruckInline,
  formatTruckType,
  TRUCK_TYPES,
  type FleetTruck,
} from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "edit"; id: string } | { type: "add" };

export function TrucksListTab() {
  const { trucks, addTruck, updateTruck } = useFleet();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });
  const editing = panel.type === "edit" ? trucks.find((t) => t.id === panel.id) : undefined;

  const columns = useMemo<Column<FleetTruck>[]>(
    () => [
      {
        key: "label",
        header: "Truck",
        cell: (row) => (
          <span className="font-medium text-slate-900">{formatTruckInline(row)}</span>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (row) => formatTruckType(row.type),
      },
      {
        key: "status",
        header: "Status",
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
  onSave: (data: { label: string; type: string; active: boolean }) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [type, setType] = useState(initial?.type ?? "26ft");
  const [active, setActive] = useState(initial?.active ?? true);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSave({ label: label.trim(), type, active });
      }}
    >
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Truck 10"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {TRUCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatTruckType(t)}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Active on roster
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
