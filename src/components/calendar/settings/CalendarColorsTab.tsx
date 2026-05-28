"use client";

import { Button } from "@/components/ui/Button";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { expandPaletteToTheme } from "@/lib/calendar/settings/color-derive";
import {
  CALENDAR_PALETTE_FIELDS,
  defaultCalendarPalette,
  normalizeHex,
  type CalendarColorPalette,
} from "@/lib/calendar/settings/color-palette";

function PaletteColorField({
  label,
  hint,
  value,
  defaultValue,
  preview,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  defaultValue: string;
  preview: { bg: string; border: string };
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span
          className="h-8 w-8 rounded border"
          style={{ backgroundColor: preview.bg, borderColor: preview.border }}
          aria-hidden
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
          aria-label={`${label} color`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalizeHex(e.target.value, defaultValue))}
          className="w-[5.5rem] rounded border border-slate-200 px-2 py-1 font-mono text-xs text-slate-800"
          spellCheck={false}
        />
      </span>
    </label>
  );
}

function previewForKey(
  palette: CalendarColorPalette,
  key: keyof CalendarColorPalette,
): { bg: string; border: string } {
  const theme = expandPaletteToTheme(palette);
  switch (key) {
    case "healthy":
      return { bg: theme.dayHealthyBg, border: theme.dayHealthyBorder };
    case "warning":
      return { bg: theme.dayWarningBg, border: theme.dayWarningBorder };
    case "critical":
      return { bg: theme.dayCriticalBg, border: theme.dayCriticalBorder };
    case "closed":
      return { bg: theme.dayClosedBg, border: theme.dayClosedBorder };
    case "holds":
      return { bg: theme.holdRowBg, border: theme.holdBorder };
    case "waitlist":
      return { bg: theme.waitlistRowBg, border: theme.waitlistBorder };
    case "fta":
      return { bg: theme.ftaBg, border: theme.ftaText };
    case "crewWarning":
      return { bg: theme.crewWarningBg, border: theme.crewWarningText };
    case "notes":
      return { bg: theme.notesIconBg, border: theme.notesIconText };
    case "bookedMark":
      return { bg: theme.bookedMarkBg, border: theme.bookedMarkText };
    case "bookingRate":
      return { bg: theme.dayHealthyBg, border: theme.bookingRateText };
    case "today":
      return { bg: theme.todayBadgeBg, border: theme.todayRing };
  }
}

export function CalendarColorsTab() {
  const { colorPalette, updatePaletteColor, resetColors } = useCalendarSettings();
  const defaults = defaultCalendarPalette();

  return (
    <div className="space-y-4">
      <Button type="button" variant="secondary" size="sm" onClick={resetColors}>
        Reset to defaults
      </Button>

      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
        {CALENDAR_PALETTE_FIELDS.map((field) => (
          <div key={field.key} className="bg-white px-3 first:rounded-t-lg last:rounded-b-lg">
            <PaletteColorField
              label={field.label}
              hint={field.hint}
              value={colorPalette[field.key]}
              defaultValue={defaults[field.key]}
              preview={previewForKey(colorPalette, field.key)}
              onChange={(v) => updatePaletteColor(field.key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
