"use client";

import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { organizationTypeLabel } from "@/lib/people/display";
import { upsertCustomOrganization } from "@/lib/people/organizations-storage";
import { ORGANIZATION_TYPES, type OrganizationRecord, type OrganizationType } from "@/lib/people/types";
import { useEffect, useMemo, useState } from "react";

type AddOrganizationSidebarProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (organization: OrganizationRecord) => void;
};

function generateOrgId(name: string): string {
  return `org-${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
}

export function AddOrganizationSidebar({ open, onClose, onCreated }: AddOrganizationSidebarProps) {
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("realtor");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setOrgType("realtor");
    setPhone("");
    setEmail("");
    setAddress("");
    setWebsite("");
    setNotes("");
  }, [open]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  function handleSave() {
    if (!canSave) return;
    const now = new Date().toISOString();
    const organization: OrganizationRecord = {
      id: generateOrgId(name),
      name: name.trim(),
      orgType,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      website: website.trim() || null,
      primaryContactId: null,
      moveIds: [],
      notes: notes.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    upsertCustomOrganization(organization);
    onCreated(organization);
    onClose();
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Add organization"
      description="Create a new company, facility, or partner — including moving companies."
      widthClassName="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
            Save organization
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <SettingsField label="Organization name">
          <SettingsInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company or facility name"
          />
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
              placeholder="info@example.com"
            />
          </SettingsField>
        </div>

        <SettingsField label="Address">
          <SettingsInput
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, city, state"
          />
        </SettingsField>

        <SettingsField label="Website">
          <SettingsInput
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </SettingsField>

        <SettingsField label="Notes">
          <SettingsTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Partnership terms, context…"
          />
        </SettingsField>
      </div>
    </DetailSidebar>
  );
}
