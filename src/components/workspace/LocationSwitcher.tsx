"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ALL_LOCATIONS_SCOPE } from "@/lib/workspace/constants";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LocationSwitcherProps = {
  className?: string;
};

export function LocationSwitcher({ className }: LocationSwitcherProps) {
  const {
    isReady,
    activeScope,
    activeLocation,
    allowedLocations,
    canUseAllLocations,
    isAllLocationsView,
    hasMultipleLocations,
    setActiveScope,
    config,
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!isReady || !hasMultipleLocations) {
    return null;
  }

  const label = isAllLocationsView ? "All locations" : activeLocation?.name ?? "Location";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        <MapPin className="h-4 w-4 shrink-0 text-slate-300" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 opacity-60 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select location"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {config.company.name}
          </p>
          {canUseAllLocations ? (
            <ScopeOption
              selected={activeScope === ALL_LOCATIONS_SCOPE}
              label="All locations"
              hint="Combined view"
              onSelect={() => {
                setActiveScope(ALL_LOCATIONS_SCOPE);
                setOpen(false);
              }}
            />
          ) : null}
          {allowedLocations.map((loc) => (
            <ScopeOption
              key={loc.id}
              selected={activeScope === loc.id}
              label={loc.name}
              hint={loc.status === "planned" ? "Planned" : loc.isPrimary ? "Primary" : undefined}
              onSelect={() => {
                setActiveScope(loc.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ScopeOption({
  selected,
  label,
  hint,
  onSelect,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
        selected && "bg-brand-50/80",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="font-medium text-slate-900">{label}</span>
        {hint ? <span className="ml-1.5 text-xs text-slate-500">{hint}</span> : null}
      </span>
      {selected ? <Check className="h-4 w-4 shrink-0 text-brand-600" /> : null}
    </button>
  );
}
