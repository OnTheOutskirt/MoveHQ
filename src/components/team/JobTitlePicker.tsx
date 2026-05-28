"use client";

import type { JobTitle } from "@/lib/team/types";
import { fieldJobTitleOptions } from "@/lib/operations/crew-sync";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type JobTitlePickerProps = {
  value: JobTitle[];
  onChange: (titles: JobTitle[]) => void;
};

export function JobTitlePicker({ value, onChange }: JobTitlePickerProps) {
  const { terminology } = useTerminology();
  const options = useMemo(
    () => ["Manager" as const, ...fieldJobTitleOptions(terminology)] as JobTitle[],
    [terminology],
  );

  function toggle(title: JobTitle) {
    if (value.includes(title)) {
      onChange(value.filter((t) => t !== title));
    } else {
      onChange([...value, title]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((title) => {
        const selected = value.includes(title);
        return (
          <button
            key={title}
            type="button"
            onClick={() => toggle(title)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
}
