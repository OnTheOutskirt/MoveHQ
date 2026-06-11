"use client";

import { createPortal } from "react-dom";

type DispatchScheduleDragTooltipProps = {
  open: boolean;
  x: number;
  y: number;
  lines: string[];
};

export function DispatchScheduleDragTooltip({
  open,
  x,
  y,
  lines,
}: DispatchScheduleDragTooltipProps) {
  if (!open || lines.length === 0 || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[250] -translate-x-1/2 rounded-md px-2.5 py-1.5 text-left text-[11px] font-semibold leading-snug shadow-md"
      style={{
        top: y + 14,
        left: x,
        backgroundColor: "#0f766e",
        color: "#f0fdfa",
        boxShadow:
          "0 4px 14px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, #0f766e 35%, transparent)",
      }}
    >
      {lines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </div>,
    document.body,
  );
}
