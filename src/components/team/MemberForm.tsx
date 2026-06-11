"use client";

import { useRoleTemplates } from "@/components/providers/RoleTemplatesProvider";
import { JobTitlePicker } from "@/components/team/JobTitlePicker";
import { MemberAccessSection } from "@/components/team/MemberAccessSection";
import { PhoneInput } from "@/components/team/PhoneInput";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import {
  enforceAccessRules,
  getAccessDefaultsForPermission,
} from "@/lib/team/permissions";
import { DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import type { RoleLocationAccess } from "@/lib/team/role-templates";
import {
  PAY_TYPES,
  type CapabilityOverrides,
  type TeamMemberFormData,
  type TeamMemberRecord,
} from "@/lib/team/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

type MemberFormProps = {
  initial: TeamMemberFormData;
  onSubmit: (data: TeamMemberFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
};

function FormRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", className)}>{children}</div>;
}

function prepareForm(data: TeamMemberFormData): TeamMemberFormData {
  return { ...data, ...enforceAccessRules(data) };
}

export function MemberForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = "Save member",
}: MemberFormProps) {
  const { locationDefaultForLevel } = useRoleTemplates();
  const [form, setForm] = useState<TeamMemberFormData>(prepareForm(initial));
  const [ripplingError, setRipplingError] = useState<string | null>(null);

  const primaryLocationId = form.primaryLocationId ?? DEFAULT_PRIMARY_LOCATION_ID;
  const locationAccess: RoleLocationAccess =
    form.locationAccess ?? locationDefaultForLevel(form.permissionLevel);

  function patch<K extends keyof TeamMemberFormData>(key: K, value: TeamMemberFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPermissionLevel(level: TeamMemberRecord["permissionLevel"]) {
    const access = getAccessDefaultsForPermission(level);
    setForm((prev) => ({
      ...prev,
      permissionLevel: level,
      hasSoftwareAccess: access.hasSoftwareAccess,
      hasCrewAppAccess: access.hasCrewAppAccess,
      locationAccess: locationDefaultForLevel(level),
      capabilityOverrides: undefined,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ripplingEmpNo = form.ripplingEmpNo.trim();
    if (!ripplingEmpNo) {
      setRipplingError("Rippling employee number is required.");
      return;
    }
    setRipplingError(null);
    onSubmit(prepareForm({ ...form, ripplingEmpNo }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Profile</p>
        <FormRow>
          <SettingsField label="First name">
            <SettingsInput
              required
              value={form.firstName}
              onChange={(e) => patch("firstName", e.target.value)}
            />
          </SettingsField>
          <SettingsField label="Last name">
            <SettingsInput
              required
              value={form.lastName}
              onChange={(e) => patch("lastName", e.target.value)}
            />
          </SettingsField>
        </FormRow>

        <FormRow>
          <SettingsField label="Email">
            <SettingsInput
              type="email"
              required
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </SettingsField>
          <SettingsField label="Phone">
            <PhoneInput value={form.phone} onChange={(v) => patch("phone", v)} />
          </SettingsField>
        </FormRow>

        <SettingsField
          label="Rippling employee #"
          hint="Required for payroll export — not shown on the directory."
        >
          <SettingsInput
            required
            value={form.ripplingEmpNo}
            onChange={(e) => {
              patch("ripplingEmpNo", e.target.value);
              if (ripplingError) setRipplingError(null);
            }}
            placeholder="e.g. 1001"
            inputMode="numeric"
            aria-invalid={ripplingError != null}
          />
          {ripplingError ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {ripplingError}
            </p>
          ) : null}
        </SettingsField>

        <FormRow>
          <SettingsField label="Nickname" hint="Optional — how they're known day to day.">
            <SettingsInput
              value={form.nickname}
              onChange={(e) => patch("nickname", e.target.value)}
              placeholder="e.g. Carlos"
            />
          </SettingsField>
          <SettingsField label="Status">
            <SettingsSelect
              value={form.status}
              onChange={(e) => patch("status", e.target.value as TeamMemberRecord["status"])}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SettingsSelect>
          </SettingsField>
        </FormRow>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Field roles</p>
        <p className="text-xs text-slate-500">
          What they do on trucks and dispatch — separate from dashboard login.
        </p>
        <JobTitlePicker value={form.jobTitles} onChange={(v) => patch("jobTitles", v)} />
      </section>

      <MemberAccessSection
        permissionLevel={form.permissionLevel}
        capabilityOverrides={form.capabilityOverrides}
        primaryLocationId={primaryLocationId}
        locationAccess={locationAccess}
        onPermissionLevelChange={setPermissionLevel}
        onCapabilityOverridesChange={(overrides) =>
          patch(
            "capabilityOverrides",
            overrides && Object.keys(overrides).length > 0 ? overrides : undefined,
          )
        }
        onPrimaryLocationChange={(id) => patch("primaryLocationId", id)}
        onLocationAccessChange={(access) => patch("locationAccess", access)}
      />

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pay</p>
        <FormRow>
          <SettingsField label="Pay type">
            <SettingsSelect
              value={form.payType}
              onChange={(e) => patch("payType", e.target.value as TeamMemberRecord["payType"])}
            >
              {PAY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "hourly" ? "Hourly" : "Salary"}
                </option>
              ))}
            </SettingsSelect>
          </SettingsField>
          {form.payType === "hourly" ? (
            <SettingsField label="Hourly pay rate">
              <SettingsInput
                type="number"
                min={0}
                step={0.5}
                value={form.payRate || ""}
                onChange={(e) => patch("payRate", Number(e.target.value))}
                placeholder="22.00"
              />
            </SettingsField>
          ) : (
            <SettingsField label="Annual salary">
              <SettingsInput
                type="number"
                min={0}
                step={1000}
                value={form.salaryAmount || ""}
                onChange={(e) => patch("salaryAmount", Number(e.target.value))}
                placeholder="55000"
              />
            </SettingsField>
          )}
        </FormRow>
      </section>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onDelete ? (
            <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={onDelete}>
              Delete
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
