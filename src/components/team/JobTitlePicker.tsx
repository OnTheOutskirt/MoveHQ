"use client";

import { JOB_TITLES, type JobTitle } from "@/lib/team/types";
import { cn } from "@/lib/utils";

type JobTitlePickerProps = {
  value: JobTitle[];
  onChange: (titles: JobTitle[]) => void;
};

export function JobTitlePicker({ value, onChange }: JobTitlePickerProps) {
  function toggle(title: JobTitle) {
    if (value.includes(title)) {
      onChange(value.filter((t) => t !== title));
    } else {
      onChange([...value, title]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {JOB_TITLES.map((title) => {
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
