"use client";

import { useEffect, useState } from "react";

type EditableNumberInputProps = {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Value committed when the field is left blank on blur. Defaults to `min ?? 0`. */
  fallback?: number;
  className?: string;
  "aria-label"?: string;
};

/**
 * Number input that lets you fully clear the cell while typing (shows empty) and
 * accepts 0. Commits the parsed number as you type; on blur, an empty field
 * falls back to `fallback` (or `min`/0). Clamps to min/max when provided.
 */
export function EditableNumberInput({
  value,
  onCommit,
  min,
  max,
  step,
  fallback,
  className,
  "aria-label": ariaLabel,
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      aria-label={ariaLabel}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        if (raw === "") return;
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) return;
        let next = parsed;
        if (typeof min === "number") next = Math.max(min, next);
        if (typeof max === "number") next = Math.min(max, next);
        onCommit(next);
      }}
      onBlur={() => {
        if (draft === "" || Number.isNaN(Number(draft))) {
          const fb = fallback ?? min ?? 0;
          setDraft(String(fb));
          onCommit(fb);
        }
      }}
      className={className}
    />
  );
}
