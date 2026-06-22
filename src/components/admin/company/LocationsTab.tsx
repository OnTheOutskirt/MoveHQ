"use client";

import { LocationHoursEditor } from "@/components/admin/company/LocationHoursEditor";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { generateLocationId } from "@/lib/workspace/locations";
import { defaultLocationBusinessFields, mergeLocationWithDefaults } from "@/lib/workspace/location-profile";
import type { LocationStatus, WorkspaceLocation } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_OPTIONS: { id: LocationStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "planned", label: "Planned" },
  { id: "inactive", label: "Inactive" },
];

export function LocationsTab() {
  const { config, updateConfig, hasMultipleLocations } = useWorkspace();
  const [activeId, setActiveId] = useState(
    () => config.locations.find((l) => l.isPrimary)?.id ?? config.locations[0]?.id ?? "",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const active = useMemo(
    () => config.locations.find((l) => l.id === activeId) ?? config.locations[0] ?? null,
    [config.locations, activeId],
  );

  function patchLocations(next: WorkspaceLocation[]) {
    updateConfig({ ...config, locations: next });
  }

  function patchActive(patch: Partial<WorkspaceLocation>) {
    if (!active) return;
    patchLocations(
      config.locations.map((l) => (l.id === active.id ? { ...l, ...patch } : l)),
    );
  }

  function setPrimary(id: string) {
    patchLocations(
      config.locations.map((l) => ({ ...l, isPrimary: l.id === id })),
    );
  }

  function addLocation() {
    const template = config.locations.find((l) => l.isPrimary) ?? config.locations[0];
    const next = mergeLocationWithDefaults(
      {
        id: generateLocationId(),
        companyId: config.company.id,
        name: "New location",
        shortName: "NEW",
        status: "planned",
        isPrimary: false,
        addressLine1: "",
        city: "",
        state: "",
        zip: "",
        timezone: template?.timezone ?? "America/Chicago",
        phone: "",
        email: "",
        ...defaultLocationBusinessFields(),
      },
      config.company.id,
    );
    patchLocations([...config.locations, next]);
    setActiveId(next.id);
  }

  function confirmDelete() {
    if (!active || config.locations.length <= 1) return;
    const next = config.locations.filter((l) => l.id !== active.id);
    const withPrimary = active.isPrimary
      ? next.map((l, i) => ({ ...l, isPrimary: i === 0 }))
      : next;
    patchLocations(withPrimary);
    setActiveId(withPrimary[0]?.id ?? "");
    setDeleteOpen(false);
  }

  const canDelete = Boolean(active) && config.locations.length > 1;

  return (
    <div
      className={cn(
        "gap-4",
        hasMultipleLocations
          ? "grid lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)]"
          : "flex w-full max-w-none flex-col",
      )}
    >
      {hasMultipleLocations ? (
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Branches</CardTitle>
            <p className="text-xs text-slate-500">
              {config.locations.filter((l) => l.status === "active").length} active
            </p>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            <ul className="space-y-0.5">
              {config.locations.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(loc.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active?.id === loc.id
                        ? "bg-brand-50 font-medium text-brand-900"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="min-w-0 flex-1 truncate">{loc.name}</span>
                    {loc.isPrimary ? (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 w-full gap-1"
              onClick={addLocation}
            >
              <Plus className="h-3.5 w-3.5" />
              Add location
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="min-w-0 w-full space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {hasMultipleLocations ? "Locations" : "Location & business info"}
            </h2>
          </div>
          {!hasMultipleLocations ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 gap-1"
              onClick={addLocation}
            >
              <Plus className="h-3.5 w-3.5" />
              Add location
            </Button>
          ) : null}
        </div>

        {active ? (
          <Card className="w-full">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{active.name}</CardTitle>
                <p className="text-sm text-slate-500">
                  {active.status === "active" ? "Active branch" : active.status}
                  {active.isPrimary ? " · Primary location" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {hasMultipleLocations && !active.isPrimary ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setPrimary(active.id)}
                  >
                    Set as primary
                  </Button>
                ) : null}
                {hasMultipleLocations ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-red-700 hover:bg-red-50"
                    disabled={!canDelete}
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Location name" className="sm:col-span-2">
                <SettingsInput
                  value={active.name}
                  onChange={(e) => patchActive({ name: e.target.value })}
                />
              </SettingsField>
              {hasMultipleLocations ? (
                <SettingsField label="Short code" hint="Square badge on moves when multi-branch.">
                  <SettingsInput
                    value={active.shortName}
                    onChange={(e) => patchActive({ shortName: e.target.value })}
                  />
                </SettingsField>
              ) : null}
              {hasMultipleLocations ? (
                <SettingsField label="Status">
                  <select
                    value={active.status}
                    onChange={(e) => patchActive({ status: e.target.value as LocationStatus })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </SettingsField>
              ) : null}
              <SettingsField label="Street address" className="sm:col-span-2">
                <SettingsInput
                  value={active.addressLine1}
                  onChange={(e) => patchActive({ addressLine1: e.target.value })}
                />
              </SettingsField>
              <SettingsField label="City">
                <SettingsInput value={active.city} onChange={(e) => patchActive({ city: e.target.value })} />
              </SettingsField>
              <SettingsField label="State">
                <SettingsInput value={active.state} onChange={(e) => patchActive({ state: e.target.value })} />
              </SettingsField>
              <SettingsField label="ZIP">
                <SettingsInput value={active.zip} onChange={(e) => patchActive({ zip: e.target.value })} />
              </SettingsField>
              <SettingsField label="Phone">
                <SettingsInput
                  type="tel"
                  value={active.phone}
                  onChange={(e) => patchActive({ phone: e.target.value })}
                />
              </SettingsField>
              <SettingsField label="Email">
                <SettingsInput
                  type="email"
                  value={active.email}
                  onChange={(e) => patchActive({ email: e.target.value })}
                />
              </SettingsField>
              <SettingsField label="Website" className="sm:col-span-2">
                <SettingsInput
                  value={active.website}
                  onChange={(e) => patchActive({ website: e.target.value })}
                  placeholder="https://"
                />
              </SettingsField>
              <SettingsField
                label="Google review link"
                hint="Paste your Google Business Profile review URL. Shown on the crew feedback portal when the customer's rating meets your threshold (Admin → Defaults → Post-move reviews)."
                className="sm:col-span-2"
              >
                <SettingsInput
                  value={active.googleReviewUrl}
                  onChange={(e) => patchActive({ googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/your-business/review"
                />
              </SettingsField>

              <div className="sm:col-span-2">
                <LocationHoursEditor location={active} onChange={patchActive} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">Add a location to get started.</p>
        )}

        {hasMultipleLocations ? (
          <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={addLocation}>
            <Plus className="h-3.5 w-3.5" />
            Add another location
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${active?.name ?? "location"}?`}
        description="Moves and history tied to this branch will need to be reassigned before this is safe in production. In this demo, the branch is removed from settings only."
        confirmLabel="Delete location"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
