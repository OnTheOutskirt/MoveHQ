"use client";

import {
  applyKnownLocation,
  collectKnownLocations,
  CUSTOM_LOCATION_KEY,
  emptyJobDayLocation,
  formatJobDayLocationAddress,
  googleMapsDirectionsUrl,
  googleMapsRouteEmbedUrl,
  googleMapsSearchUrl,
  harPropertySearchUrl,
  INTAKE_LOCATION_TYPES,
  isHouseLocationType,
  locationsMatch,
  resolveLocationSelectKey,
  scopeDestinationForMove,
  scopeOriginForMove,
  SCOPE_DESTINATION_KEY,
  SCOPE_ORIGIN_KEY,
  syncLocationFormattedAddress,
  type KnownJobDayLocation,
} from "@/lib/moves/job-day-locations";
import { intakeLocationLabel } from "@/lib/moves/intake-display";
import type { IntakeLocationType } from "@/lib/moves/flat-rate-intake";
import type { JobDayLocation, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type JobDayLocationsEditorProps = {
  move: MoveRecord;
  locations: JobDayLocation[];
  onChange: (locations: JobDayLocation[]) => void;
};

function JobDayRouteMap({ locations }: { locations: JobDayLocation[] }) {
  const embedUrl = useMemo(() => googleMapsRouteEmbedUrl(locations), [locations]);
  const directionsUrl = useMemo(() => googleMapsDirectionsUrl(locations), [locations]);

  if (!embedUrl) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
        Add origin and destination addresses to preview the route
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <iframe
        title="Route map"
        src={embedUrl}
        className="aspect-[16/10] h-auto w-full min-h-[10rem] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 border-t border-slate-200 bg-white py-2 text-xs font-medium text-brand-600 hover:bg-slate-50"
        >
          Open full route in Google Maps
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      ) : null}
    </div>
  );
}

function LocationSlotEditor({
  title,
  accent,
  location,
  scopeDefault,
  knownLocations,
  onChange,
  onRemove,
  canRemove,
}: {
  title: string;
  accent: "origin" | "destination" | "stop";
  location: JobDayLocation;
  scopeDefault: JobDayLocation | null;
  knownLocations: KnownJobDayLocation[];
  onChange: (loc: JobDayLocation) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const address = formatJobDayLocationAddress(location);
  const selectKey = resolveLocationSelectKey(location, scopeDefault, knownLocations);
  const isCustom = selectKey === CUSTOM_LOCATION_KEY;
  const [editing, setEditing] = useState(
    isCustom || (scopeDefault == null && location.role === "stop"),
  );

  const options = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (scopeDefault) {
      list.push({
        key: scopeDefault.role === "origin" ? SCOPE_ORIGIN_KEY : SCOPE_DESTINATION_KEY,
        label:
          scopeDefault.role === "origin"
            ? "Origin (scope of work)"
            : "Destination (scope of work)",
      });
    }
    for (const k of knownLocations) {
      if (k.key === SCOPE_ORIGIN_KEY || k.key === SCOPE_DESTINATION_KEY) continue;
      list.push({ key: k.key, label: k.label });
    }
    list.push({ key: CUSTOM_LOCATION_KEY, label: "Type a new address…" });
    return list;
  }, [knownLocations, scopeDefault]);

  const titleClass =
    accent === "origin"
      ? "text-brand-800"
      : accent === "destination"
        ? "text-emerald-800"
        : "text-violet-800";

  function patch<K extends keyof JobDayLocation>(key: K, value: JobDayLocation[K]) {
    onChange(syncLocationFormattedAddress({ ...location, [key]: value }));
  }

  function handleSelectChange(key: string) {
    if (key === CUSTOM_LOCATION_KEY) {
      setEditing(true);
      if (scopeDefault && !address) {
        onChange({ ...emptyJobDayLocation(location.role, location.label), id: location.id });
      }
      return;
    }
    if (key === SCOPE_ORIGIN_KEY && scopeDefault?.role === "origin") {
      setEditing(false);
      onChange({ ...scopeDefault, id: location.id });
      return;
    }
    if (key === SCOPE_DESTINATION_KEY && scopeDefault?.role === "destination") {
      setEditing(false);
      onChange({ ...scopeDefault, id: location.id });
      return;
    }
    const known = knownLocations.find((k) => k.key === key);
    if (known) {
      setEditing(false);
      onChange(applyKnownLocation(location, known));
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h4 className={cn("text-sm font-semibold", titleClass)}>{title}</h4>
        {canRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
            aria-label={`Remove ${title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="px-3 py-2.5">
        {!editing ? (
          <div>
            {address ? (
              <>
                <p className="text-sm font-medium text-slate-900">{address}</p>
                {location.locationType ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {intakeLocationLabel(location.locationType)}
                  </p>
                ) : null}
                {location.accessNotes ? (
                  <p className="mt-0.5 text-xs text-slate-500">{location.accessNotes}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={googleMapsSearchUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                  >
                    <MapPin className="h-3 w-3" />
                    Map
                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                  </a>
                  {isHouseLocationType(location.locationType) ? (
                    <a
                      href={harPropertySearchUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                    >
                      Property (HAR)
                      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">No address on file</p>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={isCustom ? CUSTOM_LOCATION_KEY : selectKey}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
            >
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/80 p-2.5">
              {location.role === "stop" ? (
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Stop label</span>
                  <input
                    value={location.label ?? ""}
                    onChange={(e) => patch("label", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </label>
              ) : null}
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Street</span>
                <input
                  value={location.street}
                  onChange={(e) => patch("street", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">City, state, ZIP</span>
                <input
                  value={location.cityStateZip}
                  onChange={(e) => patch("cityStateZip", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Type</span>
                  <select
                    value={location.locationType}
                    onChange={(e) =>
                      patch("locationType", e.target.value as IntakeLocationType | "")
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  >
                    <option value="">—</option>
                    {INTAKE_LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {intakeLocationLabel(t)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Access</span>
                  <input
                    value={location.accessNotes ?? ""}
                    onChange={(e) => patch("accessNotes", e.target.value)}
                    placeholder="Stairs, elevator…"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Done
                </button>
                {scopeDefault && !locationsMatch(location, scopeDefault) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      onChange({ ...scopeDefault, id: location.id });
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-brand-700"
                  >
                    Use scope {scopeDefault.role}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function JobDayLocationsEditor({
  move,
  locations,
  onChange,
}: JobDayLocationsEditorProps) {
  const knownLocations = useMemo(() => collectKnownLocations(move), [move]);
  const scopeOrigin = scopeOriginForMove(move);
  const scopeDestination = scopeDestinationForMove(move);

  const origin = locations.find((l) => l.role === "origin");
  const destination = locations.find((l) => l.role === "destination");
  const stops = locations.filter((l) => l.role === "stop");

  const showOrigin = scopeOrigin != null;
  const showDestination = scopeDestination != null;

  function commit(
    nextOrigin: JobDayLocation | undefined,
    nextStops: JobDayLocation[],
    nextDestination: JobDayLocation | undefined,
  ) {
    onChange([
      ...(nextOrigin ? [nextOrigin] : []),
      ...nextStops,
      ...(nextDestination ? [nextDestination] : []),
    ]);
  }

  function addStop() {
    const stop = emptyJobDayLocation("stop", `Stop ${stops.length + 1}`);
    commit(origin, [...stops, stop], destination);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Locations</h3>

      {showOrigin ? (
        <LocationSlotEditor
          title="Origin"
          accent="origin"
          location={origin ?? scopeOrigin!}
          scopeDefault={scopeOrigin}
          knownLocations={knownLocations}
          onChange={(loc) => commit(loc, stops, destination)}
        />
      ) : null}

      {stops.map((stop, i) => (
        <LocationSlotEditor
          key={stop.id}
          title={stop.label ?? `Stop ${i + 1}`}
          accent="stop"
          location={stop}
          scopeDefault={null}
          knownLocations={knownLocations}
          onChange={(loc) => {
            const next = [...stops];
            next[i] = loc;
            commit(origin, next, destination);
          }}
          onRemove={() =>
            commit(
              origin,
              stops.filter((s) => s.id !== stop.id),
              destination,
            )
          }
          canRemove
        />
      ))}

      {showOrigin && showDestination ? (
        <button
          type="button"
          onClick={addStop}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add stop
        </button>
      ) : null}

      {showDestination ? (
        <LocationSlotEditor
          title="Destination"
          accent="destination"
          location={destination ?? scopeDestination!}
          scopeDefault={scopeDestination}
          knownLocations={knownLocations}
          onChange={(loc) => commit(origin, stops, loc)}
        />
      ) : null}

      <JobDayRouteMap locations={locations} />
    </div>
  );
}
