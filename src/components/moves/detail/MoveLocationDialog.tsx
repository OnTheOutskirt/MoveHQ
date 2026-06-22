"use client";

import { Button } from "@/components/ui/Button";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** Show a search box only when there are this many locations or more. */
const SEARCH_THRESHOLD = 10;

type MoveLocationDialogProps = {
  open: boolean;
  onClose: () => void;
  currentLocationId: string;
  locations: WorkspaceLocation[];
  onSelect: (locationId: string, locationLabel: string) => void;
};

export function MoveLocationDialog({
  open,
  onClose,
  currentLocationId,
  locations,
  onSelect,
}: MoveLocationDialogProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const showSearch = locations.length >= SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    if (!showSearch || !query.trim()) return locations;
    const q = query.trim().toLowerCase();
    return locations.filter((loc) =>
      `${loc.name} ${loc.shortName} ${loc.city} ${loc.state}`.toLowerCase().includes(q),
    );
  }, [locations, query, showSearch]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-location-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <h2 id="move-location-dialog-title" className="text-lg font-semibold text-slate-900">
            Change location
          </h2>
          <p className="mt-1 text-sm text-slate-600">Move this job to a different branch.</p>
        </div>

        {showSearch ? (
          <div className="shrink-0 border-b border-slate-100 px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations…"
                autoFocus
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">No locations match.</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((loc) => {
                const selected = loc.id === currentLocationId;
                return (
                  <li key={loc.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected) onSelect(loc.id, loc.name);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                        selected && "bg-brand-50",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {loc.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {[loc.city, loc.state].filter(Boolean).join(", ")}
                          {loc.isPrimary ? " · Primary" : ""}
                          {loc.status === "planned" ? " · Planned" : ""}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-100 px-5 py-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
