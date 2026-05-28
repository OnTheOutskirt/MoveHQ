"use client";

import { pillStyle } from "@/lib/calendar/color-styles";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DAY_PILL =
  "inline-flex shrink-0 cursor-default items-center justify-center rounded-full px-1.5 py-px text-[8px] font-semibold";

type DayWarningIconProps = {
  labels: string[];
  colors: CalendarColorTheme;
};

export function DayWarningIcon({ labels, colors }: DayWarningIconProps) {
  const text = labels.join("\n");
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => setOpen(false), []);

  return (
    <>
      <span
        ref={anchorRef}
        className={DAY_PILL}
        style={pillStyle(colors.crewWarningBg, colors.crewWarningText)}
        role="img"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={2.5} />
      </span>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[200] -translate-x-1/2 rounded-md px-2 py-1.5",
              "text-left text-[11px] font-semibold leading-snug shadow-md",
            )}
            style={{
              top: coords.top,
              left: coords.left,
              backgroundColor: colors.crewWarningBg,
              color: colors.crewWarningText,
              boxShadow: `0 4px 14px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, ${colors.crewWarningText} 35%, transparent)`,
            }}
          >
            {labels.map((label) => (
              <span key={label} className="block whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
