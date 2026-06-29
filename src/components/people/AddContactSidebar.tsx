"use client";

import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { personKindLabel } from "@/lib/people/display";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { upsertCustomPerson } from "@/lib/people/people-storage";
import { PERSON_KINDS, type OrganizationRecord, type PersonKind, type PersonRecord } from "@/lib/people/types";
import { useEffect, useMemo, useState } from "react";

type AddContactSidebarProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (person: PersonRecord) => void;
};

function generatePersonId(name: string): string {
  return `person-${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
}

export function AddContactSidebar({ open, onClose, onCreated }: AddContactSidebarProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PersonKind>("lead");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);

  useEffect(() => {
    if (!open) return;
    setOrganizations(
      listAllOrganizations().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    );
    setName("");
    setKind("lead");
    setPhone("");
    setEmail("");
    setOrganizationId("");
    setTitle("");
    setNotes("");
  }, [open]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  function handleSave() {
    if (!canSave) return;
    const now = new Date().toISOString();
    const person: PersonRecord = {
      id: generatePersonId(name),
      name: name.trim(),
      kind,
      referralType: null,
      vendorType: null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      organizationId: organizationId || null,
      title: title.trim() || null,
      moveIds: [],
      notes: notes.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    upsertCustomPerson(person);
    onCreated(person);
    onClose();
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Add contact"
      description="Create a new person in the directory."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
            Save contact
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <SettingsField label="Name">
          <SettingsInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
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
            <SettingsInput
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(216) 555-0100"
            />
          </SettingsField>
          <SettingsField label="Email">
            <SettingsInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </SettingsField>
        </div>

        <SettingsField label="Organization" hint="Optional — link to a brokerage, facility, or vendor.">
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

        <SettingsField label="Title" hint="Role at their organization (optional).">
          <SettingsInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Listing agent"
          />
        </SettingsField>

        <SettingsField label="Notes">
          <SettingsTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, preferences, history…"
          />
        </SettingsField>
      </div>
    </DetailSidebar>
  );
}
