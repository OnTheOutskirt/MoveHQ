"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate } from "@/lib/moves/format";
import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import { getPeopleForOrganization } from "@/lib/people/mock-data";
import { organizationTypeConfig } from "@/lib/people/display";
import type { OrganizationRecord } from "@/lib/people/types";
import Link from "next/link";

type OrganizationDetailSidebarProps = {
  organization: OrganizationRecord | null;
  onClose: () => void;
  onSelectPerson: (personId: string) => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{children}</div>
    </div>
  );
}

export function OrganizationDetailSidebar({
  organization,
  onClose,
  onSelectPerson,
}: OrganizationDetailSidebarProps) {
  const people = organization ? getPeopleForOrganization(organization.id) : [];
  const moves = organization
    ? MOCK_MOVES.filter((m) => organization.moveIds.includes(m.id))
    : [];

  return (
    <DetailSidebar
      open={organization != null}
      onClose={onClose}
      title={organization?.name ?? ""}
      description={
        organization ? organizationTypeConfig[organization.orgType].label : undefined
      }
      widthClassName="max-w-lg"
    >
      {organization ? (
        <div className="space-y-6">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${organizationTypeConfig[organization.orgType].badge}`}
          >
            {organizationTypeConfig[organization.orgType].label}
          </span>

          <div className="grid gap-4">
            {organization.address ? <Field label="Address">{organization.address}</Field> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                {organization.phone ? (
                  <a href={`tel:${organization.phone}`} className="text-brand-600 hover:underline">
                    {organization.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Email">
                {organization.email ? (
                  <a
                    href={`mailto:${organization.email}`}
                    className="text-brand-600 hover:underline"
                  >
                    {organization.email}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
            </div>
          </div>

          {organization.notes ? <Field label="Notes">{organization.notes}</Field> : null}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Contacts ({people.length})
            </p>
            <ul className="mt-2 space-y-2">
              {people.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPerson(p.id)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <p className="font-medium text-slate-900">{p.name}</p>
                    {p.title ? <p className="text-xs text-slate-500">{p.title}</p> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>

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
