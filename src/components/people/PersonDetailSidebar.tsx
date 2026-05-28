"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate } from "@/lib/moves/format";
import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import { getOrganizationForPerson } from "@/lib/people/mock-data";
import {
  organizationTypeLabel,
  personKindConfig,
  referralPartnerTypeLabel,
} from "@/lib/people/display";
import type { PersonRecord } from "@/lib/people/types";
import Link from "next/link";

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
      description={person ? personKindConfig[person.kind].label : undefined}
    >
      {person ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              {person.phone ? (
                <a href={`tel:${person.phone}`} className="text-brand-600 hover:underline">
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
            </div>
          ) : null}

          {person.notes ? <Field label="Notes">{person.notes}</Field> : null}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Related moves ({moves.length})
            </p>
            <ul className="mt-2 space-y-2">
              {moves.map((move) => (
                <li key={move.id}>
                  <Link
                    href={`/moves/${move.id}`}
                    className="block rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <p className="font-medium text-slate-900">{move.reference}</p>
                    <p className="text-xs text-slate-500">
                      {moveStageDisplayLabel(move)} · {formatMoveDate(move.preferredDate)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </DetailSidebar>
  );
}
