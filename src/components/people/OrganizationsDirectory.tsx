"use client";

import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import {
  DirectoryKindFilters,
  type DirectoryKindFilter,
} from "@/components/people/DirectoryKindFilters";
import { useSettings } from "@/components/providers/SettingsProvider";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  organizationMatchesKindFilter,
  organizationMatchesReferralTypeFilter,
  organizationMatchesVendorTypeFilter,
  peopleAtOrganization,
} from "@/lib/people/organization-directory-filters";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { listAllPeople } from "@/lib/people/people-storage";
import {
  organizationTypeConfig,
  organizationTypeLabel,
  vendorTypeConfig,
} from "@/lib/people/display";
import type { OrganizationRecord } from "@/lib/people/types";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import {
  catalogReferralTypeBadge,
  catalogReferralTypeLabel,
  catalogVendorTypeBadge,
  catalogVendorTypeLabel,
} from "@/lib/settings/field-catalog-runtime";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type OrganizationsDirectoryProps = {
  onSelectOrganization: (org: OrganizationRecord) => void;
};

function referralTypeLabel(id: string, entries: FieldCatalogEntry[]): string {
  return entries.find((e) => e.id === id)?.label ?? catalogReferralTypeLabel(id);
}

function referralTypeBadge(id: string, entries: FieldCatalogEntry[]): string {
  return entries.find((e) => e.id === id)?.badgeClass ?? catalogReferralTypeBadge(id);
}

function vendorTypeLabel(id: string, entries: FieldCatalogEntry[]): string {
  return entries.find((e) => e.id === id)?.label ?? catalogVendorTypeLabel(id);
}

function vendorTypeBadge(id: string, entries: FieldCatalogEntry[]): string {
  return (
    entries.find((e) => e.id === id)?.badgeClass ??
    vendorTypeConfig[id]?.badge ??
    catalogVendorTypeBadge(id)
  );
}

function organizationTypeDisplay(
  org: OrganizationRecord,
  people: ReturnType<typeof listAllPeople>,
  referralTypes: FieldCatalogEntry[],
  vendorTypes: FieldCatalogEntry[],
): { label: string; badge: string; subtitle: string | null } {
  if (org.orgType === "vendor") {
    const vendorContact = peopleAtOrganization(org.id, people).find(
      (p) => p.kind === "vendor" && p.vendorType,
    );
    if (vendorContact?.vendorType) {
      return {
        label: vendorTypeLabel(vendorContact.vendorType, vendorTypes),
        badge: vendorTypeBadge(vendorContact.vendorType, vendorTypes),
        subtitle: "Vendor",
      };
    }
    return {
      label: organizationTypeLabel(org.orgType),
      badge: organizationTypeConfig.vendor.badge,
      subtitle: "Vendor",
    };
  }

  const referralOrgTypes = new Set([
    "realtor",
    "storage_facility",
    "developer",
    "restoration_company",
    "senior_living",
  ]);
  if (referralOrgTypes.has(org.orgType)) {
    return {
      label: referralTypeLabel(org.orgType, referralTypes),
      badge: referralTypeBadge(org.orgType, referralTypes),
      subtitle: "Referral organization",
    };
  }

  return {
    label: organizationTypeLabel(org.orgType),
    badge: organizationTypeConfig[org.orgType].badge,
    subtitle: null,
  };
}

export function OrganizationsDirectory({ onSelectOrganization }: OrganizationsDirectoryProps) {
  const { settings } = useSettings();
  const referralTypes = settings.fieldCatalog.referralTypes;
  const vendorTypes = settings.fieldCatalog.vendorTypes;
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<DirectoryKindFilter>("all");
  const [referralTypeFilter, setReferralTypeFilter] = useState<string | "all">("all");
  const [vendorTypeFilter, setVendorTypeFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const allPeople = listAllPeople();
    const q = search.trim().toLowerCase();
    return listAllOrganizations()
      .filter((o) => {
        if (kindFilter !== "all" && !organizationMatchesKindFilter(o, kindFilter, allPeople)) {
          return false;
        }
        if (
          kindFilter === "referral" &&
          referralTypeFilter !== "all" &&
          !organizationMatchesReferralTypeFilter(o, referralTypeFilter, allPeople)
        ) {
          return false;
        }
        if (
          kindFilter === "vendor" &&
          vendorTypeFilter !== "all" &&
          !organizationMatchesVendorTypeFilter(o, vendorTypeFilter, allPeople)
        ) {
          return false;
        }
        if (!q) return true;
        const linkedNames = peopleAtOrganization(o.id, allPeople)
          .map((p) => p.name)
          .join(" ");
        return (
          o.name.toLowerCase().includes(q) ||
          (o.email?.toLowerCase().includes(q) ?? false) ||
          (o.address?.toLowerCase().includes(q) ?? false) ||
          linkedNames.toLowerCase().includes(q) ||
          organizationTypeLabel(o.orgType).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [search, kindFilter, referralTypeFilter, vendorTypeFilter]);

  const columns = useMemo<Column<OrganizationRecord>[]>(
    () => {
      const allPeople = listAllPeople();
      return [
      {
        key: "name",
        header: "Organization",
        cell: (o) => (
          <button
            type="button"
            onClick={() => onSelectOrganization(o)}
            className="group flex w-full min-w-0 items-center gap-1 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900 group-hover:text-brand-700">{o.name}</p>
              {o.address ? (
                <p className="truncate text-xs text-slate-400">{o.address}</p>
              ) : null}
              {o.email ? <p className="truncate text-xs text-slate-400">{o.email}</p> : null}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (o) => {
          const { label, badge, subtitle } = organizationTypeDisplay(
            o,
            allPeople,
            referralTypes,
            vendorTypes,
          );
          return (
            <div className="space-y-0.5">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${badge}`}>
                {label}
              </span>
              {subtitle ? <p className="text-[10px] text-slate-500">{subtitle}</p> : null}
            </div>
          );
        },
      },
      {
        key: "contacts",
        header: "Contacts",
        cell: (o) => {
          const linked = peopleAtOrganization(o.id, allPeople);
          if (linked.length === 0) {
            return <span className="text-slate-400">—</span>;
          }
          const primary = linked[0];
          return (
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-700">{primary.name}</p>
              {linked.length > 1 ? (
                <p className="text-[10px] text-slate-500">+{linked.length - 1} more</p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Contact",
        className: "w-32",
        cell: (o) => (
          <DirectoryContactActions
            name={o.name}
            phone={o.phone}
            email={o.email}
            moveIds={o.moveIds}
            stopPropagation
          />
        ),
      },
      {
        key: "moves",
        header: "Moves",
        cell: (o) => (
          <span className="font-medium tabular-nums text-slate-800">{o.moveIds.length}</span>
        ),
      },
    ];
    },
    [onSelectOrganization, referralTypes, vendorTypes],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organization, address, email, contacts…"
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
        onRowClick={onSelectOrganization}
        getRowKey={(o) => o.id}
        emptyMessage="No organizations match your search."
      />
    </div>
  );
}
