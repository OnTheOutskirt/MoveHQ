"use client";

import { getCapacityTone } from "@/lib/calendar/capacity";
import {
  capacityToneStyle,
  holdPillStyle,
} from "@/lib/calendar/color-styles";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import { cn } from "@/lib/utils";

type CapacityLineProps = {
  label: string;
  booked: number;
  capacity: number;
  className?: string;
  muted?: boolean;
  large?: boolean;
  hold?: number;
  holdPillText?: string;
  colors: CalendarColorTheme;
};

export function CapacityLine({
  label,
  booked,
  capacity,
  className,
  muted = false,
  large = false,
  hold = 0,
  holdPillText,
  colors,
}: CapacityLineProps) {
  const tone = muted ? "ok" : getCapacityTone(booked, capacity);
  const capacityStyle = capacityToneStyle(colors, tone, muted);
  const bookedStyle =
    hold > 0 && !muted
      ? { color: colors.holdBookedText, fontWeight: 600 as const }
      : capacityStyle;
  const slashStyle = { color: muted ? colors.resourceMutedText : "#94a3b8" };

  const holdPillClass =
    "rounded-full px-1.5 py-px text-[8px] font-semibold";

  const numbers = (
    <span className={cn(large ? "text-sm font-semibold sm:text-base" : "text-sm font-semibold")}>
      <span style={bookedStyle}>{booked}</span>
      <span style={slashStyle}>/</span>
      <span style={capacityStyle}>{capacity}</span>
    </span>
  );

  if (large) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-0.5 leading-tight", className)}>
        {numbers}
        <span
          className={cn("text-[10px] sm:text-[11px]")}
          style={{ color: muted ? colors.resourceMutedText : colors.resourceNormalText }}
        >
          {label}
        </span>
        {hold > 0 && holdPillText && !muted && (
          <span className={holdPillClass} style={holdPillStyle(colors)}>
            {holdPillText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="flex flex-wrap items-baseline gap-x-1 leading-tight text-[11px] sm:text-xs">
        {numbers}
        <span style={{ color: muted ? colors.resourceMutedText : colors.resourceNormalText }}>
          {label}
        </span>
      </p>
      {hold > 0 && holdPillText && !muted && (
        <span className={cn("inline-flex", holdPillClass)} style={holdPillStyle(colors)}>
          {holdPillText}
        </span>
      )}
    </div>
  );
}
