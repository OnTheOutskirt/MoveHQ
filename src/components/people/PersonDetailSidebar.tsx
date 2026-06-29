"use client";

import { CombineRecordDialog } from "@/components/people/CombineRecordDialog";
import { DirectoryContactActions } from "@/components/people/DirectoryContactActions";
import { DirectoryCommunicationHistory } from "@/components/people/DirectoryCommunicationHistory";
import { DirectoryRelatedMoves } from "@/components/people/DirectoryRelatedMoves";
import { ReferralTouchLogSection } from "@/components/people/ReferralTouchLogSection";
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
import { personKindConfig, personKindLabel, referralPartnerTypeLabel } from "@/lib/people/display";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { removeCustomPerson, upsertCustomPerson } from "@/lib/people/people-storage";
import { PERSON_KINDS, type OrganizationRecord, type PersonKind, type PersonRecord } from "@/lib/people/types";
import { Combine, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PersonDetailSidebarProps = {
  person: PersonRecord | null;
  onClose: () => void;
  onChanged?: (person: PersonRecord) => void;
  onDeleted?: () => void;
};

export function PersonDetailSidebar({
  person,
  onClose,
  onChanged,
  onDeleted,
}: PersonDetailSidebarProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PersonKind>("lead");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [notes, setNotes] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [combineOpen, setCombineOpen] = useState(false);

  useEffect(() => {
    if (!person) return;
    setName(person.name);
    setKind(person.kind);
    setPhone(person.phone ?? "");
    setEmail(person.email ?? "");
    setTitle(person.title ?? "");
    setOrganizationId(person.organizationId ?? "");
    setNotes(person.notes ?? "");
    setOrganizations(
      listAllOrganizations().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    );
  }, [person]);

  const moves = useMemo(
    () => (person ? MOCK_MOVES.filter((m) => person.moveIds.includes(m.id)) : []),
    [person],
  );

  if (!person) {
    return (
      <DetailSidebar open={false} onClose={onClose} title="">
        <span />
      </DetailSidebar>
    );
  }

  function handleSave() {
    if (!person) return;
    const updated: PersonRecord = {
      ...person,
      name: name.trim() || person.name,
      kind,
      phone: phone.trim() || null,
      email: email.trim() || null,
      title: title.trim() || null,
      organizationId: organizationId || null,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    upsertCustomPerson(updated);
    onChanged?.(updated);
  }

  function handleDelete() {
    if (!person) return;
    removeCustomPerson(person.id);
    onDeleted?.();
    onClose();
  }

  return (
    <>
      <DetailSidebar
        open={person != null}
        onClose={onClose}
        title={name || person.name}
        headerBelow={
          <>
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${personKindConfig[kind].badge}`}
            >
              {personKindConfig[kind].label}
            </span>
            {kind === "referral" && person.referralType ? (
              <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {referralPartnerTypeLabel(person.referralType)}
              </span>
            ) : null}
          </>
        }
        headerExtra={
          <DirectoryContactActions
            name={name || person.name}
            phone={phone}
            email={email}
            moveIds={person.moveIds}
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
          <SettingsField label="Name">
            <SettingsInput value={name} onChange={(e) => setName(e.target.value)} />
          </SettingsField>

          <SettingsField label="Type">
            <SettingsSelect value={kind} onChange={(e) => setKind(e.target.value as PersonKind)}>
              {PERSON_KINDS.map((k) => (
                <option key={k} value={k}>
                  {personKindLabel(k)}
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

          {person.secondaryPhones?.length || person.secondaryEmails?.length ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Also on file (merged)
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[...(person.secondaryPhones ?? []), ...(person.secondaryEmails ?? [])].map((v) => (
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

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Title">
              <SettingsInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </SettingsField>
            <SettingsField label="Organization">
              <SettingsSelect
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
              >
                <option value="">No organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
          </div>

          <SettingsField label="Notes">
            <SettingsTextarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </SettingsField>

          <DirectoryRelatedMoves moves={moves} showCustomerName />

          {kind === "referral" ? (
            <ReferralTouchLogSection partnerType="person" partnerId={person.id} />
          ) : null}

          <DirectoryCommunicationHistory moveIds={person.moveIds} />
        </div>
      </DetailSidebar>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Delete ${person.name}?`}
        description="This removes the contact from the directory. Are you sure?"
        confirmLabel="Delete contact"
        cancelLabel="Keep"
        variant="danger"
      />

      <CombineRecordDialog
        kind="person"
        open={combineOpen}
        current={person}
        onClose={() => setCombineOpen(false)}
        onComplete={(survivor) => onChanged?.(survivor)}
      />
    </>
  );
}
