"use client";

import { JobTitlePicker } from "@/components/team/JobTitlePicker";
import { PhoneInput } from "@/components/team/PhoneInput";
import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import {
  enforceAccessRules,
  getAccessDefaultsForPermission,
  isSoftwareAccessLocked,
  permissionLevelMeta,
} from "@/lib/team/permissions";
import { PAY_TYPES, PERMISSION_LEVELS, type TeamMemberFormData, type TeamMemberRecord } from "@/lib/team/types";
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border border-slate-200 p-3",
        disabled ? "cursor-not-allowed bg-slate-50 opacity-70" : "cursor-pointer hover:bg-slate-50",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed"
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
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
  const [form, setForm] = useState<TeamMemberFormData>(prepareForm(initial));

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
    }));
  }

  const softwareLocked = isSoftwareAccessLocked(form.permissionLevel);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(prepareForm(form));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <SettingsField label="Job roles" hint="Select all roles this person performs.">
        <JobTitlePicker value={form.jobTitles} onChange={(v) => patch("jobTitles", v)} />
      </SettingsField>

      <SettingsField label="Permission level">
        <SettingsSelect
          value={form.permissionLevel}
          onChange={(e) => setPermissionLevel(e.target.value as TeamMemberRecord["permissionLevel"])}
        >
          {PERMISSION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {permissionLevelMeta[level].label}
            </option>
          ))}
        </SettingsSelect>
        <p className="mt-1 text-xs text-slate-500">
          {permissionLevelMeta[form.permissionLevel].description}
        </p>
      </SettingsField>

      <FormRow>
        <ToggleRow
          label="JM software access"
          description={
            softwareLocked
              ? "Not available for Crew permission level."
              : "Can log into this operations dashboard."
          }
          checked={form.hasSoftwareAccess}
          disabled={softwareLocked}
          onChange={(v) => patch("hasSoftwareAccess", v)}
        />
        <ToggleRow
          label="Crew app access"
          description="Can use the mobile crew app on job days."
          checked={form.hasCrewAppAccess}
          onChange={(v) => patch("hasCrewAppAccess", v)}
        />
      </FormRow>

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
            <Button type="submit" className="w-full sm:w-auto">
              {submitLabel}
            </Button>
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
