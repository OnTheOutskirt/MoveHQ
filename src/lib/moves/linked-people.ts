import type { LinkedPersonRole, MoveLinkedPerson } from "./types";

export const linkedPersonRoleConfig: Record<
  LinkedPersonRole,
  { label: string; badge: string }
> = {
  customer: { label: "Customer", badge: "bg-brand-50 text-brand-800" },
  care_of: { label: "Care of", badge: "bg-violet-50 text-violet-800" },
  realtor: { label: "Realtor", badge: "bg-amber-50 text-amber-900" },
  senior_living: { label: "Senior living", badge: "bg-teal-50 text-teal-800" },
  referral_partner: { label: "Referral partner", badge: "bg-slate-100 text-slate-700" },
  facility: { label: "Facility", badge: "bg-teal-50 text-teal-800" },
  other: { label: "Other", badge: "bg-slate-100 text-slate-600" },
};

export function linkedPersonRoleLabel(role: LinkedPersonRole): string {
  return linkedPersonRoleConfig[role].label;
}

export function primaryCustomer(people: MoveLinkedPerson[]): MoveLinkedPerson | undefined {
  return people.find((p) => p.role === "customer" && p.isPrimary) ?? people.find((p) => p.role === "customer");
}

export function careOfContacts(people: MoveLinkedPerson[]): MoveLinkedPerson[] {
  return people.filter((p) => p.role === "care_of");
}

export function referralContacts(people: MoveLinkedPerson[]): MoveLinkedPerson[] {
  return people.filter((p) =>
    ["realtor", "senior_living", "referral_partner", "facility"].includes(p.role),
  );
}
