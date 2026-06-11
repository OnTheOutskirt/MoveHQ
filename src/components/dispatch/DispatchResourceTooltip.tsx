"use client";

import { cn } from "@/lib/utils";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipPlacement = "above" | "below";

type DispatchResourceTooltipProps = {
  children: ReactNode;
  label: string;
  detail: string;
  className?: string;
};

type TooltipCoords = {
  top: number;
  left: number;
  placement: TooltipPlacement;
};

const GAP_PX = 6;
const ESTIMATED_HEIGHT_PX = 72;

function initialCoords(anchor: HTMLElement): TooltipCoords {
  const rect = anchor.getBoundingClientRect();
  const preferAbove =
    rect.bottom + GAP_PX + ESTIMATED_HEIGHT_PX > window.innerHeight &&
    rect.top - GAP_PX - ESTIMATED_HEIGHT_PX > 0;

  return {
    top: preferAbove ? rect.top - GAP_PX : rect.bottom + GAP_PX,
    left: rect.left + rect.width / 2,
    placement: preferAbove ? "above" : "below",
  };
}

export function DispatchResourceTooltip({
  children,
  label,
  detail,
  className,
}: DispatchResourceTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords>({
    top: 0,
    left: 0,
    placement: "below",
  });

  const hasContent = Boolean(label.trim() || detail.trim());

  const show = useCallback(() => {
    if (!hasContent) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    setCoords(initialCoords(anchor));
    setOpen(true);
  }, [hasContent]);

  const hide = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    const rect = anchor.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - GAP_PX;
    const spaceAbove = rect.top - GAP_PX;
    const preferAbove = spaceBelow < tooltipHeight && spaceAbove >= spaceBelow;

    setCoords({
      top: preferAbove ? rect.top - GAP_PX : rect.bottom + GAP_PX,
      left: rect.left + rect.width / 2,
      placement: preferAbove ? "above" : "below",
    });
  }, [open, label, detail]);

  if (!hasContent) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={anchorRef}
        className={cn("block w-full", className)}
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
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[200] max-w-[14rem] -translate-x-1/2 rounded-lg px-2.5 py-2",
              "border border-slate-700/80 bg-slate-900 text-left text-white shadow-lg",
              coords.placement === "above" && "-translate-y-full",
            )}
            style={{ top: coords.top, left: coords.left }}
          >
            {label.trim() ? (
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            ) : null}
            {detail.trim() ? (
              <p
                className={cn(
                  "text-[11px] font-medium leading-snug text-slate-100",
                  label.trim() && "mt-0.5",
                )}
              >
                {detail}
              </p>
            ) : null}
          </div>,
          document.body,
        )}
    </>
  );
}
