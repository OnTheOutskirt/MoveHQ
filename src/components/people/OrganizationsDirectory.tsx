"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { getPeopleForOrganization, MOCK_ORGANIZATIONS } from "@/lib/people/mock-data";
import { organizationTypeConfig, organizationTypeLabel } from "@/lib/people/display";
import type { OrganizationRecord, OrganizationType } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type OrganizationsDirectoryProps = {
  onSelectOrganization: (org: OrganizationRecord) => void;
};

type TypeFilter = "all" | OrganizationType;

export function OrganizationsDirectory({ onSelectOrganization }: OrganizationsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_ORGANIZATIONS.filter((o) => {
      if (typeFilter !== "all" && o.orgType !== typeFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        (o.email?.toLowerCase().includes(q) ?? false) ||
        (o.address?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [search, typeFilter]);

  const columns = useMemo<Column<OrganizationRecord>[]>(
    () => [
      {
        key: "name",
        header: "Organization",
        cell: (o) => <p className="font-medium text-slate-900">{o.name}</p>,
      },
      {
        key: "type",
        header: "Type",
        cell: (o) => (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${organizationTypeConfig[o.orgType].badge}`}
          >
            {organizationTypeLabel(o.orgType)}
          </span>
        ),
      },
      {
        key: "contacts",
        header: "Contacts",
        cell: (o) => {
          const count = getPeopleForOrganization(o.id).length;
          return <span className="tabular-nums text-slate-700">{count}</span>;
        },
      },
      {
        key: "moves",
        header: "Moves",
        cell: (o) => (
          <span className="font-medium tabular-nums text-slate-800">{o.moveIds.length}</span>
        ),
      },
      {
        key: "location",
        header: "Location",
        cell: (o) => (
          <span className="line-clamp-1 text-sm text-slate-600">{o.address ?? "—"}</span>
        ),
      },
    ],
    [],
  );

  const typePills: { id: TypeFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...(["realtor", "senior_living", "commercial", "vendor", "other"] as OrganizationType[]).map(
      (t) => ({
        id: t as TypeFilter,
        label: organizationTypeLabel(t),
      }),
    ),
  ];

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search organization, address, email…"
        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />

      <div className="flex flex-wrap gap-1.5">
        {typePills.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTypeFilter(id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              typeFilter === id
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={onSelectOrganization}
        getRowKey={(o) => o.id}
        emptyMessage="No organizations match your search."
      />
    </div>
  );
}
