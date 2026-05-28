"use client";

import { DetailFieldGrid } from "@/components/moves/detail/DetailSection";
import { InlineField } from "@/components/moves/detail/inline/InlineField";
import { PropertyListingLink } from "@/components/moves/detail/PropertyListingLink";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { Button } from "@/components/ui/Button";
import {
  formatAccessEditable,
  formatAccessSummary,
  formatIntakeAddress,
  intakeLocationLabel,
  parseAccessText,
  showsDestination,
  showsOrigin,
} from "@/lib/moves/intake-display";
import { locationTypeOptions } from "@/lib/moves/intake-field-options";
import type { IntakeAddress, IntakeLocationType, IntakeStop } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus } from "lucide-react";

type MoveDetailLocationsTabProps = {
  move: MoveRecord;
};

function newStopId() {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function LocationCard({
  title,
  accent,
  addr,
  disabled,
  onPatch,
  stopLabel,
  onStopLabelSave,
  listingAddress,
}: {
  title: string;
  accent: "origin" | "destination" | "stop";
  addr: IntakeAddress;
  disabled?: boolean;
  onPatch: (partial: Partial<IntakeAddress>) => void;
  stopLabel?: string;
  onStopLabelSave?: (label: string) => void;
  /** Full address for external property listing links (e.g. Zillow). */
  listingAddress?: string | null;
}) {
  const headerClass =
    accent === "origin"
      ? "bg-brand-700 text-white"
      : accent === "destination"
        ? "bg-emerald-800 text-white"
        : "bg-violet-700 text-white";

  return (
    <article className="flex min-w-[240px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={cn("px-4 py-2 text-xs font-semibold uppercase tracking-wide", headerClass)}>
        {title}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <DetailFieldGrid cols={2}>
          {onStopLabelSave ? (
            <InlineField
              label="Stop name"
              value={stopLabel ?? ""}
              onSave={onStopLabelSave}
              disabled={disabled}
              fullWidth
            />
          ) : null}
          <InlineField
            label="Street"
            value={addr.street}
            onSave={(v) => onPatch({ street: v })}
            disabled={disabled}
            fullWidth
          />
          <InlineField
            label="City, state, ZIP"
            value={addr.cityStateZip}
            onSave={(v) => onPatch({ cityStateZip: v })}
            disabled={disabled}
            fullWidth
          />
          <InlineField
            label="Location type"
            type="select"
            options={locationTypeOptions}
            value={addr.locationType}
            displayValue={intakeLocationLabel(addr.locationType)}
            onSave={(v) => onPatch({ locationType: v as IntakeLocationType | "" })}
            disabled={disabled}
          />
          <InlineField
            label="Access"
            type="textarea"
            value={formatAccessEditable(addr.access)}
            displayValue={formatAccessSummary(addr.access)}
            onSave={(v) => onPatch({ access: parseAccessText(v) })}
            disabled={disabled}
            fullWidth
            placeholder="One per line: key: value"
          />
        </DetailFieldGrid>
        {listingAddress ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <PropertyListingLink provider="zillow" address={listingAddress} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function originListingAddress(move: MoveRecord, origin: IntakeAddress): string | null {
  const fromIntake = formatIntakeAddress(origin);
  if (fromIntake && fromIntake !== "—") return fromIntake;
  const summary = move.originAddress?.trim();
  return summary || null;
}

export function MoveDetailLocationsTab({ move }: MoveDetailLocationsTabProps) {
  const { intake, disabled, patchAddress, patchFn } = useMoveIntakeEdit(move.id);
  if (!intake) return null;

  function addStop() {
    patchFn((prev) => {
      const n = prev.stops.length + 1;
      const stop: IntakeStop = {
        id: newStopId(),
        label: `Stop ${n}`,
        street: "",
        cityStateZip: "",
        locationType: "",
        purpose: "",
      };
      return { ...prev, hasStops: true, stops: [...prev.stops, stop] };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {showsOrigin(intake) ? (
          <LocationCard
            title="Origin"
            accent="origin"
            addr={intake.origin}
            disabled={disabled}
            onPatch={(p) => patchAddress("origin", p)}
            listingAddress={originListingAddress(move, intake.origin)}
          />
        ) : null}
        {showsOrigin(intake) && showsDestination(intake) ? (
          <div className="flex shrink-0 items-center justify-center px-1 lg:py-16">
            <ArrowRight className="h-6 w-6 text-slate-300" />
          </div>
        ) : null}
        {showsDestination(intake) ? (
          <LocationCard
            title="Destination"
            accent="destination"
            addr={intake.destination}
            disabled={disabled}
            onPatch={(p) => patchAddress("destination", p)}
          />
        ) : null}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Additional stops
          </h3>
          {!disabled ? (
            <Button type="button" size="sm" variant="secondary" onClick={addStop}>
              <Plus className="h-3.5 w-3.5" />
              Additional stop
            </Button>
          ) : null}
        </div>

        {intake.stops.length > 0 ? (
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
            {intake.stops.map((stop) => (
              <LocationCard
                key={stop.id}
                title="Additional stop"
                accent="stop"
                disabled={disabled}
                stopLabel={stop.label}
                onStopLabelSave={(label) =>
                  patchFn((prev) => ({
                    ...prev,
                    stops: prev.stops.map((s) => (s.id === stop.id ? { ...s, label } : s)),
                  }))
                }
                addr={{
                  street: stop.street,
                  cityStateZip: stop.cityStateZip,
                  locationType: stop.locationType,
                  access: {},
                }}
                onPatch={(p) =>
                  patchFn((prev) => ({
                    ...prev,
                    stops: prev.stops.map((s) =>
                      s.id === stop.id
                        ? {
                            ...s,
                            street: p.street ?? s.street,
                            cityStateZip: p.cityStateZip ?? s.cityStateZip,
                            locationType:
                              (p.locationType as IntakeLocationType | "") ?? s.locationType,
                          }
                        : s,
                    ),
                  }))
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No additional stops. Use Additional stop to add a pickup or drop-off.
          </p>
        )}
      </div>
    </div>
  );
}
