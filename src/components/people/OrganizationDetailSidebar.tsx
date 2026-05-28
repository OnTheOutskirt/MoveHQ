"use client";

import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import { DirectoryCommunicationHistory } from "@/components/people/DirectoryCommunicationHistory";
import { DirectoryRelatedMoves } from "@/components/people/DirectoryRelatedMoves";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { telHref } from "@/lib/people/phone-links";
import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { getPeopleForOrganization } from "@/lib/people/mock-data";
import { organizationTypeConfig } from "@/lib/people/display";
import type { OrganizationRecord } from "@/lib/people/types";

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
      headerBelow={
        organization ? (
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${organizationTypeConfig[organization.orgType].badge}`}
          >
            {organizationTypeConfig[organization.orgType].label}
          </span>
        ) : null
      }
      widthClassName="max-w-lg"
      headerExtra={
        organization ? (
          <DirectoryContactActions
            name={organization.name}
            phone={organization.phone}
            email={organization.email}
            moveIds={organization.moveIds}
            size="md"
          />
        ) : null
      }
    >
      {organization ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {organization.address ? <Field label="Address">{organization.address}</Field> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                {organization.phone ? (
                  <a href={telHref(organization.phone)} className="text-brand-600 hover:underline">
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

          <DirectoryRelatedMoves moves={moves} />

          <DirectoryCommunicationHistory moveIds={organization.moveIds} />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Contacts ({people.length})
            </p>
            <ul className="mt-2 space-y-2">
              {people.map((p) => (
                <li key={p.id}>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:border-brand-300 hover:bg-brand-50/40">
                    <button
                      type="button"
                      onClick={() => onSelectPerson(p.id)}
                      className="min-w-0 flex-1 text-left text-sm"
                    >
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.title ? <p className="text-xs text-slate-500">{p.title}</p> : null}
                    </button>
                    <DirectoryContactActions
                      name={p.name}
                      phone={p.phone}
                      email={p.email}
                      moveIds={p.moveIds}
                      stopPropagation
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </DetailSidebar>
  );
}
