"use client";

import { CombineRecordDialog } from "@/components/people/CombineRecordDialog";
import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import { DirectoryCommunicationHistory } from "@/components/people/DirectoryCommunicationHistory";
import { DirectoryRelatedMoves } from "@/components/people/DirectoryRelatedMoves";
import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { MOCK_MOVES } from "@/lib/moves/mock-data";
import { organizationTypeConfig, organizationTypeLabel } from "@/lib/people/display";
import { getPeopleForOrganization } from "@/lib/people/mock-data";
import {
  removeCustomOrganization,
  upsertCustomOrganization,
} from "@/lib/people/organizations-storage";
import { ORGANIZATION_TYPES, type OrganizationRecord, type OrganizationType } from "@/lib/people/types";
import { Combine, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OrganizationDetailSidebarProps = {
  organization: OrganizationRecord | null;
  onClose: () => void;
  onChanged: (organization: OrganizationRecord) => void;
  onDeleted: () => void;
  onSelectPerson: (personId: string) => void;
};

export function OrganizationDetailSidebar({
  organization,
  onClose,
  onChanged,
  onDeleted,
  onSelectPerson,
}: OrganizationDetailSidebarProps) {
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("realtor");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [combineOpen, setCombineOpen] = useState(false);

  useEffect(() => {
    if (!organization) return;
    setName(organization.name);
    setOrgType(organization.orgType);
    setPhone(organization.phone ?? "");
    setEmail(organization.email ?? "");
    setAddress(organization.address ?? "");
    setWebsite(organization.website ?? "");
    setNotes(organization.notes ?? "");
  }, [organization]);

  const people = useMemo(
    () => (organization ? getPeopleForOrganization(organization.id) : []),
    [organization],
  );
  const moves = useMemo(
    () => (organization ? MOCK_MOVES.filter((m) => organization.moveIds.includes(m.id)) : []),
    [organization],
  );

  if (!organization) {
    return (
      <DetailSidebar open={false} onClose={onClose} title="">
        <span />
      </DetailSidebar>
    );
  }

  function handleSave() {
    if (!organization) return;
    const updated: OrganizationRecord = {
      ...organization,
      name: name.trim() || organization.name,
      orgType,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      website: website.trim() || null,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    upsertCustomOrganization(updated);
    onChanged(updated);
  }

  function handleDelete() {
    if (!organization) return;
    removeCustomOrganization(organization.id);
    onDeleted();
  }

  return (
    <>
      <DetailSidebar
        open={organization != null}
        onClose={onClose}
        title={name || organization.name}
        headerBelow={
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${organizationTypeConfig[orgType].badge}`}
          >
            {organizationTypeConfig[orgType].label}
          </span>
        }
        widthClassName="max-w-lg"
        headerExtra={
          <DirectoryContactActions
            name={name || organization.name}
            phone={phone}
            email={email}
            moveIds={organization.moveIds}
            size="md"
          />
        }
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-red-700 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCombineOpen(true)}
              >
                <Combine className="h-3.5 w-3.5" />
                Combine
              </Button>
            </div>
            <Button type="button" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <SettingsField label="Organization name">
            <SettingsInput value={name} onChange={(e) => setName(e.target.value)} />
          </SettingsField>

          <SettingsField label="Type">
            <SettingsSelect
              value={orgType}
              onChange={(e) => setOrgType(e.target.value as OrganizationType)}
            >
              {ORGANIZATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {organizationTypeLabel(t)}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Phone">
              <SettingsInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </SettingsField>
            <SettingsField label="Email">
              <SettingsInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </SettingsField>
          </div>

          <SettingsField label="Address">
            <SettingsInput value={address} onChange={(e) => setAddress(e.target.value)} />
          </SettingsField>

          <SettingsField label="Website">
            <SettingsInput value={website} onChange={(e) => setWebsite(e.target.value)} />
          </SettingsField>

          {organization.secondaryPhones?.length ||
          organization.secondaryEmails?.length ||
          organization.secondaryAddresses?.length ||
          organization.secondaryWebsites?.length ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Also on file (merged)
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ...(organization.secondaryPhones ?? []),
                  ...(organization.secondaryEmails ?? []),
                  ...(organization.secondaryAddresses ?? []),
                  ...(organization.secondaryWebsites ?? []),
                ].map((v) => (
                  <span
                    key={v}
                    className="inline-flex rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <SettingsField label="Notes">
            <SettingsTextarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </SettingsField>

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
      </DetailSidebar>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Delete ${organization.name}?`}
        description="This removes the organization from the directory. Are you sure?"
        confirmLabel="Delete organization"
        cancelLabel="Keep"
        variant="danger"
      />

      <CombineRecordDialog
        kind="organization"
        open={combineOpen}
        current={organization}
        onClose={() => setCombineOpen(false)}
        onComplete={(survivor) => onChanged(survivor)}
      />
    </>
  );
}
