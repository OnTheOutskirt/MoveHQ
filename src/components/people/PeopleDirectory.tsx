"use client";

import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { getOrganizationForPerson } from "@/lib/people/mock-data";
import { listAllPeople } from "@/lib/people/people-storage";
import {
  personKindConfig,
  personKindLabel,
  personTypeDisplay,
  referralPartnerTypeConfig,
} from "@/lib/people/display";
import type { PersonKind, PersonRecord, ReferralPartnerType } from "@/lib/people/types";
import { REFERRAL_PARTNER_TYPES } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type PeopleDirectoryProps = {
  onSelectPerson: (person: PersonRecord) => void;
};

type KindFilter = "all" | PersonKind;

export function PeopleDirectory({ onSelectPerson }: PeopleDirectoryProps) {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [referralTypeFilter, setReferralTypeFilter] = useState<ReferralPartnerType | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listAllPeople().filter((p) => {
      if (kindFilter !== "all" && p.kind !== kindFilter) return false;
      if (
        kindFilter === "referral" &&
        referralTypeFilter !== "all" &&
        p.referralType !== referralTypeFilter
      ) {
        return false;
      }
      if (!q) return true;
      const org = getOrganizationForPerson(p);
      const referralLabel =
        p.kind === "referral" && p.referralType
          ? referralPartnerTypeConfig[p.referralType].label
          : "";
      return (
        p.name.toLowerCase().includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false) ||
        (p.phone?.includes(q) ?? false) ||
        (org?.name.toLowerCase().includes(q) ?? false) ||
        referralLabel.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [search, kindFilter, referralTypeFilter]);

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
              <p className="font-medium text-slate-900 group-hover:text-brand-700">
                {p.name}
              </p>
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
              ? referralPartnerTypeConfig[p.referralType].badge
              : personKindConfig[p.kind].badge;
          return (
            <div className="space-y-0.5">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${badge}`}>
                {label}
              </span>
              {p.kind === "referral" && p.referralType ? (
                <p className="text-[10px] text-slate-500">Referral contact</p>
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
    [onSelectPerson],
  );

  const kindPills: { id: KindFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...(["customer", "lead", "referral", "vendor", "other"] as PersonKind[]).map((k) => ({
      id: k as KindFilter,
      label: personKindLabel(k),
    })),
  ];

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

      <div className="flex flex-wrap gap-1.5">
        {kindPills.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setKindFilter(id);
              if (id !== "referral") setReferralTypeFilter("all");
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              kindFilter === id
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {kindFilter === "referral" ? (
        <div className="flex flex-wrap gap-1.5 border-l-2 border-amber-200 pl-3">
          <button
            type="button"
            onClick={() => setReferralTypeFilter("all")}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              referralTypeFilter === "all"
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-slate-600",
            )}
          >
            All referral types
          </button>
          {REFERRAL_PARTNER_TYPES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setReferralTypeFilter(rt)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                referralTypeFilter === rt
                  ? referralPartnerTypeConfig[rt].badge
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {referralPartnerTypeConfig[rt].label}
            </button>
          ))}
        </div>
      ) : null}

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
