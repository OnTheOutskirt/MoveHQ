"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type MultiSelectOption = { value: string; label: string };

type InlineMultiSelectProps = {
  label: string;
  values: string[];
  options: readonly MultiSelectOption[];
  onSave: (values: string[]) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  /** @deprecated Prefer default bubble display */
  formatDisplay?: (values: string[]) => string;
  /** Closed state shows pill bubbles (default true). */
  bubbles?: boolean;
};

export function InlineMultiSelect({
  label,
  values,
  options,
  onSave,
  disabled,
  fullWidth,
  placeholder = "Click to add…",
  formatDisplay,
  bubbles = true,
}: InlineMultiSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(values);
  const panelRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!open) setDraft(values);
  }, [values, open]);

  useEffect(() => {
    if (open) setDraft(values);
  }, [open]);

  const commit = useCallback(() => {
    const next = draftRef.current;
    const sorted = [...next].sort();
    const prevSorted = [...values].sort();
    if (sorted.join("|") !== prevSorted.join("|")) {
      onSave(next);
    }
    setOpen(false);
  }, [onSave, values]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        commit();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, commit]);

  const selectedLabels = values.map((v) => ({
    value: v,
    label: options.find((o) => o.value === v)?.label ?? v,
  }));

  function toggle(value: string) {
    setDraft((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      draftRef.current = next;
      return next;
    });
  }

  const fieldShell = cn(
    "mt-0.5 block w-full min-w-0 rounded-md border border-transparent text-sm font-medium text-slate-900 transition-colors",
    !disabled && !open && "cursor-pointer hover:border-slate-200 hover:bg-slate-50/80",
    open && "border-slate-300 bg-white shadow-sm ring-1 ring-brand-100",
    values.length === 0 && !open && "text-slate-400",
  );

  const pillClass =
    "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-800";

  return (
    <div className={cn(fullWidth && "sm:col-span-2 lg:col-span-3")} ref={panelRef}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(fieldShell, "min-h-[2.25rem] w-full px-2 py-1.5 text-left")}
        >
          {values.length > 0 ? (
            bubbles && !formatDisplay ? (
              <span className="flex flex-wrap gap-2">
                {selectedLabels.map(({ value, label: pillLabel }) => (
                  <span key={value} className={pillClass}>
                    {pillLabel}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-sm">
                {formatDisplay ? formatDisplay(values) : selectedLabels.map((s) => s.label).join(", ")}
              </span>
            )
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
        </button>

        {open ? (
          <div
            className="absolute left-0 z-30 mt-1 w-full min-w-[16rem] max-w-md rounded-lg border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-slate-100"
            role="listbox"
            aria-labelledby={id}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ul className="max-h-64 space-y-0.5 overflow-y-auto">
              {options.map((opt) => {
                const checked = draft.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(opt.value)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-800">{opt.label}</span>
                      {checked ? <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-brand-600" /> : null}
                    </label>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit()}
              className="mt-2 w-full rounded-md bg-brand-50 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100"
            >
              Done
            </button>
          </div>
        ) : null}
      </dd>
    </div>
  );
}
