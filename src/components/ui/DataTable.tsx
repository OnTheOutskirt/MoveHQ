import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  getRowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortKey?: string | null;
  sortDirection?: SortDirection | null;
  onSortColumn?: (key: string) => void;
};

function SortHeader({
  label,
  active,
  direction,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: SortDirection | null;
  align?: "left" | "right";
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          active ? "text-brand-600" : "text-slate-400",
        )}
        aria-hidden
      />
    </span>
  );
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No records found.",
  className,
  getRowKey,
  onRowClick,
  sortKey = null,
  sortDirection = null,
  onSortColumn,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {columns.map((col) => {
              const sortable = Boolean(col.sortable && onSortColumn);
              const active = sortable && sortKey === col.key;
              const isRight = col.className?.includes("text-right");

              return (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    col.className,
                    col.headerClassName,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortColumn!(col.key)}
                      className={cn(
                        "inline-flex w-full items-center gap-1 rounded transition-colors hover:text-slate-800",
                        isRight && "justify-end",
                        active && "text-slate-800",
                      )}
                      aria-label={
                        active
                          ? `Sort by ${col.header}, ${sortDirection === "asc" ? "ascending" : "descending"}`
                          : `Sort by ${col.header}`
                      }
                    >
                      <SortHeader
                        label={col.header}
                        active={active}
                        direction={active ? sortDirection : null}
                        align={isRight ? "right" : "left"}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr
              key={getRowKey ? getRowKey(row) : i}
              className={cn(
                "hover:bg-slate-50/50",
                onRowClick && "cursor-pointer",
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-slate-700", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
