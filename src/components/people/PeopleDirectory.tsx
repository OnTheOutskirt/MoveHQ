"use client";

import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import {
  DirectoryKindFilters,
  type DirectoryKindFilter,
} from "@/components/people/DirectoryKindFilters";
import { useSettings } from "@/components/providers/SettingsProvider";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { getOrganizationForPerson } from "@/lib/people/mock-data";
import { listAllPeople } from "@/lib/people/people-storage";
import {
  personKindConfig,
  personTypeDisplay,
  vendorTypeConfig,
} from "@/lib/people/display";
import type { PersonRecord } from "@/lib/people/types";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import {
  catalogReferralTypeBadge,
  catalogVendorTypeBadge,
} from "@/lib/settings/field-catalog-runtime";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type PeopleDirectoryProps = {
  onSelectPerson: (person: PersonRecord) => void;
  /** Bump to force the list to re-read storage after create / edit / delete / merge. */
  refreshToken?: number;
};

function referralTypeBadge(id: string, entries: FieldCatalogEntry[]): string {
  return entries.find((e) => e.id === id)?.badgeClass ?? catalogReferralTypeBadge(id);
}

function vendorTypeBadge(id: string, entries: FieldCatalogEntry[]): string {
  return (
    entries.find((e) => e.id === id)?.badgeClass ??
    vendorTypeConfig[id]?.badge ??
    catalogVendorTypeBadge(id)
  );
}

export function PeopleDirectory({ onSelectPerson, refreshToken = 0 }: PeopleDirectoryProps) {
  const { settings } = useSettings();
  const referralTypes = settings.fieldCatalog.referralTypes;
  const vendorTypes = settings.fieldCatalog.vendorTypes;
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<DirectoryKindFilter>("all");
  const [referralTypeFilter, setReferralTypeFilter] = useState<string | "all">("all");
  const [vendorTypeFilter, setVendorTypeFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listAllPeople()
      .filter((p) => {
        if (kindFilter !== "all" && p.kind !== kindFilter) return false;
        if (
          kindFilter === "referral" &&
          referralTypeFilter !== "all" &&
          p.referralType !== referralTypeFilter
        ) {
          return false;
        }
        if (
          kindFilter === "vendor" &&
          vendorTypeFilter !== "all" &&
          p.vendorType !== vendorTypeFilter
        ) {
          return false;
        }
        if (!q) return true;
        const org = getOrganizationForPerson(p);
        const typeLabel = personTypeDisplay(p);
        return (
          p.name.toLowerCase().includes(q) ||
          (p.email?.toLowerCase().includes(q) ?? false) ||
          (p.phone?.includes(q) ?? false) ||
          (org?.name.toLowerCase().includes(q) ?? false) ||
          typeLabel.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, kindFilter, referralTypeFilter, vendorTypeFilter, refreshToken]);

  const columns = useMemo<Column<PersonRecord>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (p) => (
          <button
            type="button"
            onClick={() => onSelectPerson(p)}
            className="group flex w-full min-w-0 items-center gap-1 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900 group-hover:text-brand-700">{p.name}</p>
              {p.title ? <p className="text-xs text-slate-500">{p.title}</p> : null}
              {p.email ? <p className="truncate text-xs text-slate-400">{p.email}</p> : null}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ),
      },
      {
        key: "kind",
        header: "Type",
        cell: (p) => {
          const label = personTypeDisplay(p);
          const badge =
            p.kind === "referral" && p.referralType
              ? referralTypeBadge(p.referralType, referralTypes)
              : p.kind === "vendor" && p.vendorType
                ? vendorTypeBadge(p.vendorType, vendorTypes)
                : personKindConfig[p.kind].badge;
          return (
            <div className="space-y-0.5">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${badge}`}>
                {label}
              </span>
              {p.kind === "referral" ? (
                <p className="text-[10px] text-slate-500">Referral contact</p>
              ) : p.kind === "vendor" ? (
                <p className="text-[10px] text-slate-500">Vendor contact</p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "organization",
        header: "Organization",
        cell: (p) => {
          const org = getOrganizationForPerson(p);
          return org ? (
            <span className="text-slate-700">{org.name}</span>
          ) : (
            <span className="text-slate-400">—</span>
          );
        },
      },
      {
        key: "actions",
        header: "Contact",
        className: "w-32",
        cell: (p) => (
          <DirectoryContactActions
            name={p.name}
            phone={p.phone}
            email={p.email}
            moveIds={p.moveIds}
            stopPropagation
          />
        ),
      },
      {
        key: "moves",
        header: "Moves",
        cell: (p) => (
          <span className="font-medium tabular-nums text-slate-800">{p.moveIds.length}</span>
        ),
      },
    ],
    [onSelectPerson, referralTypes, vendorTypes],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, organization…"
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <DirectoryKindFilters
        kindFilter={kindFilter}
        onKindFilterChange={setKindFilter}
        referralTypeFilter={referralTypeFilter}
        onReferralTypeFilterChange={setReferralTypeFilter}
        vendorTypeFilter={vendorTypeFilter}
        onVendorTypeFilterChange={setVendorTypeFilter}
        referralTypes={referralTypes}
        vendorTypes={vendorTypes}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={onSelectPerson}
        getRowKey={(p) => p.id}
        emptyMessage="No people match your search."
      />
    </div>
  );
}
