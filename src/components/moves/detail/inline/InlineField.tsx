"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, useState } from "react";

type SelectOption = { value: string; label: string };

type InlineFieldProps = {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "date" | "number" | "textarea" | "select";
  options?: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  displayValue?: string;
};

export function InlineField({
  label,
  value,
  onSave,
  type = "text",
  options,
  placeholder = "Click to add…",
  fullWidth,
  disabled,
  displayValue,
}: InlineFieldProps) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const shown =
    displayValue ??
    (type === "select" ? options?.find((o) => o.value === value)?.label : value) ??
    "";

  function commit() {
    const next = type === "number" ? draft : draft.trim();
    if (next !== value) onSave(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  const fieldShell = cn(
    "mt-0.5 block w-full min-w-0 rounded-md border border-transparent text-sm font-medium text-slate-900 transition-colors",
    !disabled && !editing && "cursor-text hover:border-slate-200 hover:bg-slate-50/80",
    editing && "border-slate-300 bg-white shadow-sm ring-1 ring-brand-100",
    !shown && !editing && "text-slate-400",
  );

  const control = editing ? (
    type === "textarea" ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        id={id}
        value={draft}
        rows={3}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
        className={cn(fieldShell, "resize-y px-2 py-1.5")}
      />
    ) : type === "select" ? (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        id={id}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onSave(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className={cn(fieldShell, "cursor-pointer px-2 py-1.5")}
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id={id}
        type={type === "date" ? "date" : type === "number" ? "number" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        className={cn(fieldShell, "px-2 py-1")}
      />
    )
  ) : (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => !disabled && setEditing(true)}
      className={cn(fieldShell, "text-left", fullWidth && "w-full")}
    >
      {shown || placeholder}
    </button>
  );

  return (
    <div className={fullWidth ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd>{control}</dd>
    </div>
  );
}
