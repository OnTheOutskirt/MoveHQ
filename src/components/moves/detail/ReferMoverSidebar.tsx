"use client";

import { EditableNumberInput } from "@/components/settings/EditableNumberInput";
import {
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
} from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { getMoveJobDateKeys } from "@/lib/moves/move-dates";
import type { MoveRecord } from "@/lib/moves/types";
import {
  addMovingCompanyReferral,
  DEFAULT_REFERRAL_COMMISSION_RATE,
} from "@/lib/people/moving-company-referrals";
import {
  listAllOrganizations,
  upsertCustomOrganization,
} from "@/lib/people/organizations-storage";
import type { OrganizationRecord } from "@/lib/people/types";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function generateOrgId(name: string): string {
  return `org-mc-${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
}

function prefillMoveDate(move: MoveRecord): string {
  const dates = getMoveJobDateKeys(move);
  return dates[0] ?? move.intake.moveDate ?? move.preferredDate ?? "";
}

type ReferMoverSidebarProps = {
  open: boolean;
  onClose: () => void;
  move: MoveRecord;
};

export function ReferMoverSidebar({ open, onClose, move }: ReferMoverSidebarProps) {
  const [companies, setCompanies] = useState<OrganizationRecord[]>([]);
  const [orgId, setOrgId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [revenue, setRevenue] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

  function refreshCompanies(): OrganizationRecord[] {
    const next = listAllOrganizations().filter((org) => org.orgType === "moving_company");
    setCompanies(next);
    return next;
  }

  useEffect(() => {
    if (!open) return;
    const list = refreshCompanies();
    setOrgId((prev) => prev || list[0]?.id || "");
    setCustomerName(move.customerName ?? "");
    setMoveDate(prefillMoveDate(move));
    setRevenue(move.quoteAmount ?? 0);
    setNotes("");
    setSaved(false);
    setShowAddCompany(false);
    setNewCompanyName("");
  }, [open, move]);

  const commissionPreview = useMemo(
    () => Math.round(revenue * DEFAULT_REFERRAL_COMMISSION_RATE * 100) / 100,
    [revenue],
  );

  function handleAddCompany() {
    const name = newCompanyName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    const record: OrganizationRecord = {
      id: generateOrgId(name),
      name,
      orgType: "moving_company",
      phone: null,
      email: null,
      address: null,
      website: null,
      primaryContactId: null,
      moveIds: [],
      notes: "Moving-company referral partner — 10% commission",
      createdAt: now,
      updatedAt: now,
    };
    upsertCustomOrganization(record);
    refreshCompanies();
    setOrgId(record.id);
    setNewCompanyName("");
    setShowAddCompany(false);
  }

  function handleSave() {
    if (!orgId || !customerName.trim() || revenue <= 0) return;
    addMovingCompanyReferral({
      organizationId: orgId,
      customerName,
      moveDate: moveDate || null,
      revenue,
      notes: notes || null,
    });
    setSaved(true);
    onClose();
  }

  const canSave = Boolean(orgId) && customerName.trim().length > 0 && revenue > 0;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Refer to another mover"
      description={`Hand this job off to a partner moving company. A 10% commission referral is logged in the directory (${move.reference}).`}
      widthClassName="max-w-lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Commission (10%):{" "}
            <span className="font-semibold tabular-nums text-slate-800">
              {usd.format(commissionPreview)}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={!canSave || saved}>
              Log referral
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Referral details</h3>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setShowAddCompany((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            Add moving company
          </Button>
        </div>

        {showAddCompany ? (
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            <SettingsField label="Moving company name" className="min-w-[12rem] flex-1">
              <SettingsInput
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g. A Better Tripp"
              />
            </SettingsField>
            <Button
              type="button"
              size="sm"
              onClick={handleAddCompany}
              disabled={!newCompanyName.trim()}
            >
              Save company
            </Button>
          </div>
        ) : null}

        <SettingsField label="Moving company">
          <SettingsSelect value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {companies.length === 0 ? <option value="">No companies yet</option> : null}
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Referred customer / job">
            <SettingsInput
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </SettingsField>
          <SettingsField label="Move date">
            <SettingsInput
              type="date"
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
            />
          </SettingsField>
        </div>

        <SettingsField label="Job revenue ($)" hint="Commission is calculated at 10% of this amount.">
          <EditableNumberInput
            value={revenue}
            onCommit={setRevenue}
            min={0}
            step={50}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 tabular-nums"
          />
        </SettingsField>

        <SettingsField label="Notes">
          <SettingsTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why this is being referred out, special instructions…"
          />
        </SettingsField>
      </div>
    </DetailSidebar>
  );
}
