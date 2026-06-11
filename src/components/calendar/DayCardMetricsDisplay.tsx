"use client";

import { CapacityLine } from "@/components/calendar/CapacityLine";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { formatDayCardMetricLine } from "@/lib/calendar/metrics/format-metric-label";
import {
  getConfiguredDayWarningLabels,
  resolveDayCardMetrics,
} from "@/lib/calendar/metrics/resolve";
import { CalendarHoverTooltip } from "@/components/calendar/CalendarHoverTooltip";
import { totalFtaSlots } from "@/lib/calendar/capacity";
import { pillStyle } from "@/lib/calendar/color-styles";
import { expandFtaPillLabels } from "@/lib/calendar/fta";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import type { CalendarDayData } from "@/lib/calendar/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";

function ResourcePart({
  label,
  depleted,
  muted,
  depletedColor,
  mutedColor,
  normalColor,
}: {
  label: string;
  depleted: boolean;
  muted: boolean;
  depletedColor: string;
  mutedColor: string;
  normalColor: string;
}) {
  return (
    <span
      className="whitespace-nowrap"
      style={{
        color: muted ? mutedColor : depleted ? depletedColor : normalColor,
        fontWeight: !muted && depleted ? 600 : undefined,
      }}
    >
      {label}
    </span>
  );
}

type DayCardMetricsDisplayProps = {
  day: CalendarDayData;
  isPast: boolean;
  colors: CalendarColorTheme;
  locationId: string;
  className?: string;
};

export function DayCardMetricsDisplay({
  day,
  isPast,
  colors,
  locationId,
  className,
}: DayCardMetricsDisplayProps) {
  const { config } = useWorkspace();
  const { terminology } = useTerminology();
  const { primary, secondary } = resolveDayCardMetrics(
    day,
    config.calendar,
    locationId,
    terminology,
  );
  const ftaTotal = totalFtaSlots(day.ftas);
  const openSlotCodes = expandFtaPillLabels(day.ftas);
  const openSlotTooltip = openSlotCodes.join(", ");
  const hasSecondary = secondary.length > 0;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mt-0.5 space-y-0.5">
        {primary.map((metric) => {
          if (metric.displayType === "booked_available") {
            return (
              <CapacityLine
                key={metric.slot.id}
                label={metric.label}
                booked={metric.booked}
                capacity={metric.capacity}
                hold={metric.onHold}
                holdPillText={metric.holdPillText ?? undefined}
                large
                muted={isPast}
                colors={colors}
              />
            );
          }
          const line = formatDayCardMetricLine(metric, terminology);
          return (
            <p
              key={metric.slot.id}
              className="text-sm font-semibold leading-tight sm:text-base"
              style={{
                color: isPast
                  ? colors.resourceMutedText
                  : metric.depleted
                    ? colors.resourceDepletedText
                    : colors.resourceNormalText,
              }}
            >
              {line}
            </p>
          );
        })}
        {!isPast && ftaTotal > 0 && (
          <CalendarHoverTooltip
            lines={[openSlotTooltip]}
            bgColor={colors.ftaBg}
            textColor={colors.ftaText}
          >
            <span
              className="inline-flex w-fit cursor-default rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
              style={pillStyle(colors.ftaBg, colors.ftaText)}
            >
              {ftaTotal} open
            </span>
          </CalendarHoverTooltip>
        )}
      </div>

      {hasSecondary ? (
        <p
          className="mt-auto flex min-w-0 items-center gap-x-0.5 overflow-hidden pt-0.5 text-[9px] leading-tight whitespace-nowrap sm:text-[10px]"
          title={secondary.map((m) => formatDayCardMetricLine(m, terminology)).join(" · ")}
        >
          {secondary.map((metric, index) => (
            <span key={metric.slot.id} className="inline-flex shrink-0 items-center gap-x-0.5">
              {index > 0 ? (
                <span
                  className="shrink-0"
                  style={{ color: isPast ? colors.resourceMutedText : "#cbd5e1" }}
                >
                  ·
                </span>
              ) : null}
              <ResourcePart
                label={formatDayCardMetricLine(metric, terminology)}
                depleted={metric.depleted}
                muted={isPast}
                depletedColor={colors.resourceDepletedText}
                mutedColor={colors.resourceMutedText}
                normalColor={colors.resourceNormalText}
              />
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export function useConfiguredDayWarnings(
  day: CalendarDayData,
  locationId: string,
  isPast: boolean,
): string[] {
  const { config } = useWorkspace();
  const { terminology } = useTerminology();
  if (isPast) return [];
  return getConfiguredDayWarningLabels(day, config.calendar, locationId, terminology);
}
