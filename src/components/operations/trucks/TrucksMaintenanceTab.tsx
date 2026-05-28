"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatTruckInline, type TruckMaintenanceRecord } from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const STATUS_STYLES: Record<TruckMaintenanceRecord["status"], string> = {
  scheduled: "bg-sky-100 text-sky-900",
  completed: "bg-emerald-100 text-emerald-900",
  overdue: "bg-red-100 text-red-900",
};

export function TrucksMaintenanceTab() {
  const { maintenance, trucks } = useFleet();

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
    ],
    [trucks],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Maintenance tracking (sample data). Connect to fleet shop or telematics later.
      </p>
      <DataTable
        columns={columns}
        data={maintenance}
        getRowKey={(r) => r.id}
        emptyMessage="No maintenance records."
      />
    </div>
  );
}
