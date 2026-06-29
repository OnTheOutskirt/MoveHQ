"use client";

import { personKindLabel } from "@/lib/people/display";
import type { PersonKind } from "@/lib/people/types";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import {
  catalogReferralTypeBadge,
  catalogReferralTypeLabel,
  catalogVendorTypeBadge,
  catalogVendorTypeLabel,
} from "@/lib/settings/field-catalog-runtime";
import { vendorTypeConfig } from "@/lib/people/display";
import { cn } from "@/lib/utils";

export type DirectoryKindFilter = "all" | PersonKind | "moving_company";

type DirectoryKindFiltersProps = {
  kindFilter: DirectoryKindFilter;
  onKindFilterChange: (kind: DirectoryKindFilter) => void;
  referralTypeFilter: string | "all";
  onReferralTypeFilterChange: (id: string | "all") => void;
  vendorTypeFilter: string | "all";
  onVendorTypeFilterChange: (id: string | "all") => void;
  referralTypes: FieldCatalogEntry[];
  vendorTypes: FieldCatalogEntry[];
  /** Include a "Moving company" pill (organizations directory only). */
  includeMovingCompany?: boolean;
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

export function DirectoryKindFilters({
  kindFilter,
  onKindFilterChange,
  referralTypeFilter,
  onReferralTypeFilterChange,
  vendorTypeFilter,
  onVendorTypeFilterChange,
  referralTypes,
  vendorTypes,
  includeMovingCompany = false,
}: DirectoryKindFiltersProps) {
  const kindPills: { id: DirectoryKindFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...(["customer", "lead", "referral", "vendor", "other"] as PersonKind[]).map((k) => ({
      id: k as DirectoryKindFilter,
      label: personKindLabel(k),
    })),
  ];

  if (includeMovingCompany) {
    const insertAt = kindPills.findIndex((p) => p.id === "lead") + 1;
    kindPills.splice(insertAt, 0, { id: "moving_company", label: "Moving company" });
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {kindPills.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onKindFilterChange(id);
              if (id !== "referral") onReferralTypeFilterChange("all");
              if (id !== "vendor") onVendorTypeFilterChange("all");
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
            onClick={() => onReferralTypeFilterChange("all")}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              referralTypeFilter === "all"
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-slate-600",
            )}
          >
            All referral types
          </button>
          {referralTypes.map((rt) => (
            <button
              key={rt.id}
              type="button"
              onClick={() => onReferralTypeFilterChange(rt.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                referralTypeFilter === rt.id
                  ? referralTypeBadge(rt.id, referralTypes)
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {referralTypeLabel(rt.id, referralTypes)}
            </button>
          ))}
        </div>
      ) : null}

      {kindFilter === "vendor" ? (
        <div className="flex flex-wrap gap-1.5 border-l-2 border-violet-200 pl-3">
          <button
            type="button"
            onClick={() => onVendorTypeFilterChange("all")}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              vendorTypeFilter === "all"
                ? "border-violet-500 bg-violet-50 text-violet-900"
                : "border-slate-200 bg-white text-slate-600",
            )}
          >
            All vendor types
          </button>
          {vendorTypes.map((vt) => (
            <button
              key={vt.id}
              type="button"
              onClick={() => onVendorTypeFilterChange(vt.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                vendorTypeFilter === vt.id
                  ? vendorTypeBadge(vt.id, vendorTypes)
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {vendorTypeLabel(vt.id, vendorTypes)}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
