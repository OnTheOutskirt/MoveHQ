"use client";

import { useRoleTemplates } from "@/components/providers/RoleTemplatesProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
import { capabilityDescription, capabilityLabel } from "@/lib/auth/capabilities";
import {
  APP_ACCESS_META,
  appsForPermissionLevel,
} from "@/lib/team/access-profiles";
import {
  CAPABILITY_GROUPS,
  capabilitiesForRoleTemplate,
  isRoleTemplateCustomized,
  type RoleLocationAccess,
} from "@/lib/team/role-templates";
import { memberDisplayName } from "@/lib/team/format";
import { permissionLevelHighlights, permissionLevelMeta } from "@/lib/team/permissions";
import { PERMISSION_LEVELS, type PermissionLevel } from "@/lib/team/types";
import { cn } from "@/lib/utils";
import { ChevronDown, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export function RoleDefaultsTab() {
  const { members } = useTeamMembers();
  const { templates, setCapability, setLocationAccess, resetLevel, resetAll, isReady } =
    useRoleTemplates();
  const { config } = useWorkspace();
  const active = members.filter((m) => m.status === "active");
  const locations = config.locations;

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading role defaults…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl text-sm text-slate-600">
          <p>
            Five access levels cover almost everyone. Set company-wide defaults here — then open a
            person on{" "}
            <Link href="/admin/staff?tab=people" className="font-medium text-brand-600 hover:underline">
              People
            </Link>{" "}
            only when you need a one-off module or branch override.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={resetAll}>
          Reset all to defaults
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PERMISSION_LEVELS.map((level) => {
          const count = active.filter((m) => m.permissionLevel === level).length;
          const customized = isRoleTemplateCustomized(templates, level);
          const apps = appsForPermissionLevel(level);
          const highlights = permissionLevelHighlights[level];
          const locationAccess =
            templates.locationAccess[level] ??
            (level === "admin" || level === "manager" ? "all" : [locations[0]?.id ?? ""]);

          return (
            <RoleDefaultCard
              key={level}
              level={level}
              count={count}
              customized={customized}
              apps={apps}
              highlights={highlights}
              locationAccess={locationAccess}
              locations={locations}
              onReset={() => resetLevel(level)}
              onLocationChange={(access) => setLocationAccess(level, access)}
            />
          );
        })}
      </div>

      <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Advanced capability matrix</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Fine-tune which modules each access level can open — defaults match the cards above.
            </p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="sticky left-0 z-10 min-w-[14rem] bg-slate-50/95 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Module
                </th>
                {PERMISSION_LEVELS.map((level) => (
                  <th
                    key={level}
                    className="min-w-[5.75rem] px-2 py-3 text-center"
                    title={permissionLevelMeta[level].tagline}
                  >
                    <span className="block text-xs font-semibold text-slate-800">
                      {permissionLevelMeta[level].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITY_GROUPS.map((group) => (
                <Fragment key={group.id}>
                  <tr className="bg-slate-50/80">
                    <td
                      colSpan={PERMISSION_LEVELS.length + 1}
                      className="border-l-2 border-brand-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.caps.map((cap) => {
                    const description = capabilityDescription(cap);
                    return (
                      <tr key={cap} className="group border-t border-slate-100 hover:bg-slate-50/40">
                        <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-2.5 group-hover:bg-slate-50/60">
                          <p className="font-medium text-slate-900">{capabilityLabel(cap)}</p>
                          {description ? (
                            <p className="mt-0.5 max-w-xs text-xs leading-snug text-slate-500">
                              {description}
                            </p>
                          ) : null}
                        </td>
                        {PERMISSION_LEVELS.map((level) => {
                          const caps = capabilitiesForRoleTemplate(level, templates);
                          const enabled = caps.includes(cap);
                          return (
                            <td
                              key={level}
                              className={cn(
                                "px-2 py-2.5 text-center transition-colors",
                                enabled ? "bg-brand-50/40" : "bg-white",
                              )}
                            >
                              <label className="inline-flex cursor-pointer items-center justify-center p-1">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={(e) => setCapability(level, cap, e.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                  aria-label={`${permissionLevelMeta[level].label}: ${capabilityLabel(cap)}`}
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PERMISSION_LEVELS.map((level) => {
          const names = active
            .filter((m) => m.permissionLevel === level)
            .map((m) => memberDisplayName(m));
          return (
            <p key={level} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {permissionLevelMeta[level].label}:{" "}
              </span>
              {names.length > 0 ? names.join(", ") : "No active members"}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function RoleDefaultCard({
  level,
  count,
  customized,
  apps,
  highlights,
  locationAccess,
  locations,
  onReset,
  onLocationChange,
}: {
  level: PermissionLevel;
  count: number;
  customized: boolean;
  apps: ReturnType<typeof appsForPermissionLevel>;
  highlights: string[];
  locationAccess: RoleLocationAccess;
  locations: { id: string; name: string; status: string }[];
  onReset: () => void;
  onLocationChange: (access: RoleLocationAccess) => void;
}) {
  const primaryId = locations[0]?.id ?? "";
  const mode = locationAccess === "all" ? "all" : locationAccess.length <= 1 ? "primary" : "custom";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{permissionLevelMeta[level].label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{permissionLevelMeta[level].tagline}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-slate-500">{count} people</span>
          {customized ? (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
              Custom
            </span>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 hover:text-brand-600"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {apps.map((app) => (
          <span
            key={app}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
          >
            {APP_ACCESS_META[app].short}
          </span>
        ))}
        {highlights.map((h) => (
          <span
            key={h}
            className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-800"
          >
            {h}
          </span>
        ))}
      </div>

      <label className="mt-3 block text-xs text-slate-600">
        <span className="font-medium text-slate-700">Default branches</span>
        <select
          value={mode}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "all") onLocationChange("all");
            else if (next === "primary") onLocationChange([primaryId]);
            else onLocationChange(locationAccess === "all" ? [primaryId] : locationAccess);
          }}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        >
          <option value="all">All locations</option>
          <option value="primary">Primary branch only</option>
          <option value="custom">Selected branches</option>
        </select>
      </label>
      {mode === "custom" ? (
        <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs">
          {locations
            .filter((l) => l.status === "active" || l.status === "planned")
            .map((loc) => {
              const on = locationAccess !== "all" && locationAccess.includes(loc.id);
              return (
                <li key={loc.id}>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => {
                        const current = locationAccess === "all" ? [] : [...locationAccess];
                        const next = e.target.checked
                          ? [...new Set([...current, loc.id])]
                          : current.filter((id) => id !== loc.id);
                        onLocationChange(next.length > 0 ? next : [primaryId]);
                      }}
                      className="rounded border-slate-300"
                    />
                    {loc.name}
                  </label>
                </li>
              );
            })}
        </ul>
      ) : null}
    </div>
  );
}
