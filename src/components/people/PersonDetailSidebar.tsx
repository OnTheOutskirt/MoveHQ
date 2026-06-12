"use client";

import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import { DirectoryCommunicationHistory } from "@/components/people/DirectoryCommunicationHistory";
import { DirectoryRelatedMoves } from "@/components/people/DirectoryRelatedMoves";
import { ReferralTouchLogSection } from "@/components/people/ReferralTouchLogSection";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { getOrganizationForPerson } from "@/lib/people/mock-data";
import { telHref } from "@/lib/people/phone-links";
import {
  organizationTypeLabel,
  personKindConfig,
  referralPartnerTypeLabel,
} from "@/lib/people/display";
import type { PersonRecord } from "@/lib/people/types";

type PersonDetailSidebarProps = {
  person: PersonRecord | null;
  onClose: () => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{children}</div>
    </div>
  );
}

export function PersonDetailSidebar({ person, onClose }: PersonDetailSidebarProps) {
  const org = person ? getOrganizationForPerson(person) : undefined;
  const moves = person
    ? MOCK_MOVES.filter((m) => person.moveIds.includes(m.id))
    : [];

  return (
    <DetailSidebar
      open={person != null}
      onClose={onClose}
      title={person?.name ?? ""}
      headerBelow={
        person ? (
          <>
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${personKindConfig[person.kind].badge}`}
            >
              {personKindConfig[person.kind].label}
            </span>
            {person.kind === "referral" && person.referralType ? (
              <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {referralPartnerTypeLabel(person.referralType)}
              </span>
            ) : null}
          </>
        ) : null
      }
      headerExtra={
        person ? (
          <DirectoryContactActions
            name={person.name}
            phone={person.phone}
            email={person.email}
            moveIds={person.moveIds}
            size="md"
          />
        ) : null
      }
    >
      {person ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              {person.phone ? (
                <a href={telHref(person.phone)} className="text-brand-600 hover:underline">
                  {person.phone}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Email">
              {person.email ? (
                <a href={`mailto:${person.email}`} className="text-brand-600 hover:underline">
                  {person.email}
                </a>
              ) : (
                "—"
              )}
            </Field>
          </div>

          {person.title ? <Field label="Title">{person.title}</Field> : null}

          {org ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-[10px] font-semibold uppercase text-slate-500">Organization</p>
              <p className="mt-1 font-medium text-slate-900">{org.name}</p>
              <p className="text-xs text-slate-500">{organizationTypeLabel(org.orgType)}</p>
              {org.phone ? (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-3">
                  <span className="text-sm text-slate-700">{org.phone}</span>
                  <DirectoryContactActions
                    name={org.name}
                    phone={org.phone}
                    email={org.email}
                    moveIds={person.moveIds}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {person.notes ? <Field label="Notes">{person.notes}</Field> : null}

          <DirectoryRelatedMoves moves={moves} showCustomerName />

          {person.kind === "referral" ? (
            <ReferralTouchLogSection partnerType="person" partnerId={person.id} />
          ) : null}

          <DirectoryCommunicationHistory moveIds={person.moveIds} />
        </div>
      ) : null}
    </DetailSidebar>
  );
}
