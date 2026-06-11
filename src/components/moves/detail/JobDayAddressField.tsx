"use client";

import {
  formatCityStateZip,
  parseSingleLineAddress,
  US_STATE_OPTIONS,
} from "@/lib/moves/location-address";
import {
  formatJobDayLocationAddress,
  googleMapsSearchUrl,
  jobDayLocationCityStateZip,
  syncLocationFormattedAddress,
} from "@/lib/moves/job-day-locations";
import type { JobDayLocation } from "@/lib/moves/types";
import { ExternalLink } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

type JobDayAddressFieldProps = {
  location: JobDayLocation;
  defaultState?: string;
  addressSuggestions?: string[];
  onChange: (location: JobDayLocation) => void;
};

export function JobDayAddressField({
  location,
  defaultState = "",
  addressSuggestions = [],
  onChange,
}: JobDayAddressFieldProps) {
  const listId = useId();
  const formatted = formatJobDayLocationAddress(location);
  const [line, setLine] = useState(formatted);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    setLine(formatJobDayLocationAddress(location));
  }, [location]);

  const csz = jobDayLocationCityStateZip(location);
  const mapsUrl = line.trim() ? googleMapsSearchUrl(line.trim()) : null;

  const suggestions = useMemo(
    () => [...new Set(addressSuggestions.filter((s) => s.trim().length > 0))],
    [addressSuggestions],
  );

  function applyLine(value: string) {
    const parsed = parseSingleLineAddress(value, defaultState);
    onChange(
      syncLocationFormattedAddress({
        ...location,
        ...parsed,
        placeId: undefined,
      }),
    );
  }

  function patchManual(partial: Partial<JobDayLocation>) {
    onChange(syncLocationFormattedAddress({ ...location, ...partial, placeId: undefined }));
  }

  if (!manualEntry) {
    return (
      <div className="space-y-1.5">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Address</span>
          <input
            value={line}
            list={suggestions.length > 0 ? listId : undefined}
            onChange={(e) => setLine(e.target.value)}
            onBlur={() => applyLine(line)}
            placeholder="Search or paste address (Google Maps coming soon)"
            className="mt-0.5 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
        {suggestions.length > 0 ? (
          <datalist id={listId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline"
            >
              Open in Google Maps
              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setManualEntry(true)}
            className="text-[11px] font-medium text-slate-500 hover:text-brand-700"
          >
            Can&apos;t find on maps? Enter manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Street</span>
        <input
          value={location.street}
          onChange={(e) => patchManual({ street: e.target.value })}
          className="mt-0.5 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="col-span-1 block">
          <span className="text-xs font-medium text-slate-600">City</span>
          <input
            value={csz.city}
            onChange={(e) =>
              patchManual({
                city: e.target.value,
                cityStateZip: formatCityStateZip(
                  e.target.value,
                  csz.state || defaultState,
                  csz.zip,
                ),
              })
            }
            className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">State</span>
          <select
            value={csz.state || defaultState}
            onChange={(e) =>
              patchManual({
                state: e.target.value,
                cityStateZip: formatCityStateZip(csz.city, e.target.value, csz.zip),
              })
            }
            className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {US_STATE_OPTIONS.map((state) => (
              <option key={state || "blank"} value={state}>
                {state || "—"}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">ZIP</span>
          <input
            value={csz.zip}
            onChange={(e) =>
              patchManual({
                zip: e.target.value,
                cityStateZip: formatCityStateZip(
                  csz.city,
                  csz.state || defaultState,
                  e.target.value,
                ),
              })
            }
            className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          setManualEntry(false);
          setLine(formatJobDayLocationAddress(location));
        }}
        className="text-[11px] font-medium text-slate-500 hover:text-brand-700"
      >
        Use single address field
      </button>
    </div>
  );
}
