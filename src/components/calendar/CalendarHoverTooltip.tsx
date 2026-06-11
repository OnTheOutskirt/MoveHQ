"use client";

import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type CalendarHoverTooltipProps = {
  children: ReactNode;
  lines: string[];
  bgColor: string;
  textColor: string;
  className?: string;
};

export function CalendarHoverTooltip({
  children,
  lines,
  bgColor,
  textColor,
  className,
}: CalendarHoverTooltipProps) {
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
    if (lines.length === 0 || lines.every((l) => !l.trim())) return;
    updatePosition();
    setOpen(true);
  }, [lines, updatePosition]);

  const hide = useCallback(() => setOpen(false), []);

  if (lines.length === 0 || lines.every((l) => !l.trim())) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={anchorRef}
        className={cn("inline-flex", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[200] -translate-x-1/2 rounded-md px-2.5 py-1.5",
              "text-left text-[11px] font-semibold leading-snug shadow-md",
            )}
            style={{
              top: coords.top,
              left: coords.left,
              backgroundColor: bgColor,
              color: textColor,
              boxShadow: `0 4px 14px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, ${textColor} 35%, transparent)`,
            }}
          >
            {lines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
