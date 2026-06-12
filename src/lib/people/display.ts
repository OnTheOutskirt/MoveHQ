import type { OrganizationType, PersonKind, ReferralPartnerType } from "./types";
import {
  catalogReferralTypeLabel,
  catalogVendorTypeLabel,
} from "@/lib/settings/field-catalog-runtime";

export const personKindConfig: Record<
  PersonKind,
  { label: string; description: string; badge: string }
> = {
  customer: {
    label: "Customer",
    description: "Booked or completed — someone we moved or are moving",
    badge: "bg-emerald-50 text-emerald-800",
  },
  lead: {
    label: "Lead",
    description: "In the sales pipeline — not yet booked",
    badge: "bg-brand-50 text-brand-800",
  },
  referral: {
    label: "Referral contact",
    description: "Realtor, senior living coordinator, business referrer",
    badge: "bg-amber-50 text-amber-900",
  },
  vendor: {
    label: "Vendor",
    description: "Third-party partner (storage, disposal, specialty)",
    badge: "bg-violet-50 text-violet-800",
  },
  other: {
    label: "Other",
    description: "Care-of, family, misc. contacts",
    badge: "bg-slate-100 text-slate-700",
  },
};

export const referralPartnerTypeConfig: Record<
  ReferralPartnerType,
  { label: string; description: string; badge: string }
> = {
  realtor: {
    label: "Realtor",
    description: "Listing agents and buyer/seller referrals",
    badge: "bg-amber-50 text-amber-900",
  },
  storage_facility: {
    label: "Storage facility",
    description: "Self-storage or warehouse partners",
    badge: "bg-orange-50 text-orange-900",
  },
  developer: {
    label: "Developer",
    description: "Residential or commercial developers",
    badge: "bg-sky-50 text-sky-900",
  },
  restoration_company: {
    label: "Restoration company",
    description: "Water/fire damage and rebuild referrals",
    badge: "bg-rose-50 text-rose-900",
  },
  senior_living: {
    label: "Senior living",
    description: "Communities and transition coordinators",
    badge: "bg-teal-50 text-teal-800",
  },
  insurance: {
    label: "Insurance",
    description: "Adjusters and insurance partners",
    badge: "bg-indigo-50 text-indigo-900",
  },
  apartment_complex: {
    label: "Apartment complex",
    description: "Property managers and apartment community referrals",
    badge: "bg-lime-50 text-lime-900",
  },
  business: {
    label: "Business referrer",
    description: "Other businesses that send leads",
    badge: "bg-violet-50 text-violet-800",
  },
  other: {
    label: "Other referral",
    description: "Misc. referral sources",
    badge: "bg-slate-100 text-slate-700",
  },
};

export const organizationTypeConfig: Record<
  OrganizationType,
  { label: string; description: string; badge: string }
> = {
  realtor: {
    label: "Realtor / brokerage",
    description: "Listing agents and real estate offices",
    badge: "bg-amber-50 text-amber-900",
  },
  senior_living: {
    label: "Senior living",
    description: "Communities and transition coordinators",
    badge: "bg-teal-50 text-teal-800",
  },
  storage_facility: {
    label: "Storage facility",
    description: "Self-storage and warehouse companies",
    badge: "bg-orange-50 text-orange-900",
  },
  developer: {
    label: "Developer",
    description: "Residential or commercial developers",
    badge: "bg-sky-50 text-sky-900",
  },
  restoration_company: {
    label: "Restoration company",
    description: "Mitigation and rebuild partners",
    badge: "bg-rose-50 text-rose-900",
  },
  apartment_complex: {
    label: "Apartment complex",
    description: "Property management and apartment communities",
    badge: "bg-lime-50 text-lime-900",
  },
  commercial: {
    label: "Commercial",
    description: "Offices, retail, clinics — B2B accounts",
    badge: "bg-sky-50 text-sky-900",
  },
  vendor: {
    label: "Vendor",
    description: "Companies we subcontract or coordinate with",
    badge: "bg-violet-50 text-violet-800",
  },
  other: {
    label: "Other",
    description: "Misc. organizations",
    badge: "bg-slate-100 text-slate-700",
  },
};

export function personKindLabel(kind: PersonKind): string {
  return personKindConfig[kind].label;
}

export function organizationTypeLabel(type: OrganizationType): string {
  return organizationTypeConfig[type].label;
}

export function referralPartnerTypeLabel(type: ReferralPartnerType): string {
  return referralPartnerTypeConfig[type].label;
}

/** Display label for person type column — includes referral or vendor subtype when applicable. */
export function personTypeDisplay(person: {
  kind: PersonKind;
  referralType: ReferralPartnerType | null;
  vendorType?: string | null;
}): string {
  if (person.kind === "referral" && person.referralType) {
    return catalogReferralTypeLabel(person.referralType);
  }
  if (person.kind === "vendor" && person.vendorType) {
    return catalogVendorTypeLabel(person.vendorType);
  }
  return personKindLabel(person.kind);
}

export function vendorTypeLabel(type: string): string {
  return vendorTypeConfig[type]?.label ?? type.replace(/_/g, " ");
}

export const vendorTypeConfig: Record<string, { label: string; description: string; badge: string }> =
  {
    truck_fleet: {
      label: "Truck fleet",
      description: "Rental trucks and fleet partners",
      badge: "bg-slate-100 text-slate-800",
    },
    claim_repairs: {
      label: "Claim repairs",
      description: "Claims repair vendors",
      badge: "bg-rose-50 text-rose-900",
    },
    operations_materials: {
      label: "Operations / materials",
      description: "Bubble wrap, packing materials, supplies",
      badge: "bg-orange-50 text-orange-900",
    },
    special_services: {
      label: "Special services",
      description: "Crating, playgrounds, pool table, special-order packing",
      badge: "bg-violet-50 text-violet-800",
    },
    hr_vendors: {
      label: "HR vendors",
      description: "Benefits, chaplain, and employee services",
      badge: "bg-teal-50 text-teal-800",
    },
    crew_vendors: {
      label: "Crew vendors",
      description: "Subcontract crew and labor partners",
      badge: "bg-brand-50 text-brand-800",
    },
    fleet_repair: {
      label: "Fleet repair",
      description: "Repair fleet, lift gate, truck maintenance",
      badge: "bg-indigo-50 text-indigo-900",
    },
  };
