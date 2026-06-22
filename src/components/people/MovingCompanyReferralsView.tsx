"use client";

import { EditableNumberInput } from "@/components/settings/EditableNumberInput";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import {
  listAllOrganizations,
  upsertCustomOrganization,
} from "@/lib/people/organizations-storage";
import {
  addMovingCompanyReferral,
  DEFAULT_REFERRAL_COMMISSION_RATE,
  listMovingCompanyReferrals,
  referralCommission,
  removeMovingCompanyReferral,
  updateMovingCompanyReferral,
  type MovingCompanyReferral,
} from "@/lib/people/moving-company-referrals";
import type { OrganizationRecord } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { Building2, Check, Plus, Trash2 } from "lucide-react";
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

export function MovingCompanyReferralsView() {
  const [companies, setCompanies] = useState<OrganizationRecord[]>([]);
  const [referrals, setReferrals] = useState<MovingCompanyReferral[]>([]);

  // Add-referral form state
  const [orgId, setOrgId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [revenue, setRevenue] = useState(0);

  // Add-company form state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

  function refreshCompanies(): OrganizationRecord[] {
    const next = listAllOrganizations().filter((org) => org.orgType === "moving_company");
    setCompanies(next);
    return next;
  }

  useEffect(() => {
    const list = refreshCompanies();
    setReferrals(listMovingCompanyReferrals());
    setOrgId((prev) => prev || list[0]?.id || "");
  }, []);

  const totals = useMemo(() => {
    let revenueSum = 0;
    let commissionSum = 0;
    let unpaidCommission = 0;
    for (const referral of referrals) {
      revenueSum += referral.revenue;
      const commission = referralCommission(referral);
      commissionSum += commission;
      if (!referral.paid) unpaidCommission += commission;
    }
    return { revenueSum, commissionSum, unpaidCommission };
  }, [referrals]);

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

  function handleAddReferral() {
    if (!orgId || !customerName.trim() || revenue <= 0) return;
    const created = addMovingCompanyReferral({
      organizationId: orgId,
      customerName,
      moveDate: moveDate || null,
      revenue,
    });
    setReferrals((prev) => [created, ...prev]);
    setCustomerName("");
    setMoveDate("");
    setRevenue(0);
  }

  function togglePaid(id: string, paid: boolean) {
    updateMovingCompanyReferral(id, { paid });
    setReferrals((prev) => prev.map((r) => (r.id === id ? { ...r, paid } : r)));
  }

  function deleteReferral(id: string) {
    removeMovingCompanyReferral(id);
    setReferrals((prev) => prev.filter((r) => r.id !== id));
  }

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "Unknown company";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-center">
        <SummaryCard label="Referrals" value={String(referrals.length)} />
        <SummaryCard label="Referred revenue" value={usd.format(totals.revenueSum)} />
        <SummaryCard label="Commission (10%)" value={usd.format(totals.commissionSum)} />
        <SummaryCard
          label="Unpaid commission"
          value={usd.format(totals.unpaidCommission)}
          highlight={totals.unpaidCommission > 0}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-amber-600" />
            Log a referral
          </h3>
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
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            <SettingsField label="Moving company name" className="min-w-[14rem] flex-1">
              <SettingsInput
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g. A Better Tripp"
              />
            </SettingsField>
            <Button type="button" size="sm" onClick={handleAddCompany} disabled={!newCompanyName.trim()}>
              Save company
            </Button>
          </div>
        ) : null}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <SettingsField label="Referred customer / job">
            <SettingsInput
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </SettingsField>
          <SettingsField label="Move date">
            <SettingsInput type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} />
          </SettingsField>
          <SettingsField label="Job revenue ($)">
            <EditableNumberInput
              value={revenue}
              onCommit={setRevenue}
              min={0}
              step={50}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 tabular-nums"
            />
          </SettingsField>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Commission at 10%:{" "}
            <span className="font-semibold tabular-nums text-slate-800">
              {usd.format(Math.round(revenue * DEFAULT_REFERRAL_COMMISSION_RATE * 100) / 100)}
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleAddReferral}
            disabled={!orgId || !customerName.trim() || revenue <= 0}
          >
            <Plus className="h-4 w-4" />
            Add referral
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Moving company</th>
              <th className="px-3 py-2">Referred customer</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2 text-right">Commission (10%)</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {referrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-slate-50/60">
                <td className="px-3 py-2 font-medium text-slate-800">
                  {companyName(referral.organizationId)}
                </td>
                <td className="px-3 py-2 text-slate-700">{referral.customerName}</td>
                <td className="px-3 py-2 text-slate-500">{referral.moveDate ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                  {usd.format(referral.revenue)}
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                  {usd.format(referralCommission(referral))}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => togglePaid(referral.id, !referral.paid)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                      referral.paid
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200",
                    )}
                    title={referral.paid ? "Mark unpaid" : "Mark paid"}
                  >
                    {referral.paid ? <Check className="h-3 w-3" /> : null}
                    {referral.paid ? "Paid" : "Unpaid"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => deleteReferral(referral.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete referral for ${referral.customerName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">
                  No referrals logged yet. Add one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-2",
        highlight ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white shadow-sm",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
