import type { DayCapacityStatus } from "./types";
import type { CapacityTone } from "./capacity";
import type { CalendarColorTheme } from "./settings/colors";
import type { CSSProperties } from "react";

export function dayStatusCellStyle(
  colors: CalendarColorTheme,
  status: DayCapacityStatus,
): CSSProperties {
  switch (status) {
    case "healthy":
      return { backgroundColor: colors.dayHealthyBg };
    case "warning":
      return { backgroundColor: colors.dayWarningBg };
    case "critical":
      return { backgroundColor: colors.dayCriticalBg };
    case "closed":
      return { backgroundColor: colors.dayClosedBg };
  }
}

export function dayStatusBorderStyle(
  colors: CalendarColorTheme,
  status: DayCapacityStatus,
): CSSProperties {
  switch (status) {
    case "healthy":
      return { borderColor: colors.dayHealthyBorder };
    case "warning":
      return { borderColor: colors.dayWarningBorder };
    case "critical":
      return { borderColor: colors.dayCriticalBorder };
    case "closed":
      return { borderColor: colors.dayClosedBorder };
  }
}

export function capacityToneStyle(
  colors: CalendarColorTheme,
  tone: CapacityTone,
  muted = false,
): CSSProperties {
  if (muted) return { color: colors.resourceMutedText };
  switch (tone) {
    case "ok":
      return { color: colors.capacityOkText };
    case "warn":
      return { color: colors.capacityWarnText, fontWeight: 600 };
    case "full":
      return { color: colors.capacityFullText, fontWeight: 700 };
  }
}

export function holdPillStyle(colors: CalendarColorTheme): CSSProperties {
  return {
    backgroundColor: colors.holdBg,
    color: colors.holdText,
    boxShadow: `inset 0 0 0 1px ${colors.holdBorder}`,
  };
}

export function waitlistPillStyle(colors: CalendarColorTheme): CSSProperties {
  return {
    backgroundColor: colors.waitlistBg,
    color: colors.waitlistText,
    boxShadow: `inset 0 0 0 1px ${colors.waitlistBorder}`,
  };
}

export function holdAccentButtonStyle(colors: CalendarColorTheme): CSSProperties {
  return {
    backgroundColor: colors.holdBg,
    color: colors.holdText,
    borderColor: colors.holdBorder,
    boxShadow: `inset 0 0 0 1px ${colors.holdBorder}`,
  };
}

export function waitlistAccentButtonStyle(colors: CalendarColorTheme): CSSProperties {
  return {
    backgroundColor: colors.waitlistBg,
    color: colors.waitlistText,
    borderColor: colors.waitlistBorder,
    boxShadow: `inset 0 0 0 1px ${colors.waitlistBorder}`,
  };
}

export function pillStyle(bg: string, text: string): CSSProperties {
  return { backgroundColor: bg, color: text };
}

export function holdTableStyle(colors: CalendarColorTheme): {
  container: CSSProperties;
  header: CSSProperties;
  body: CSSProperties;
  rowText: CSSProperties;
  cellText: CSSProperties;
} {
  return {
    container: {
      backgroundColor: colors.holdRowBg,
      borderColor: colors.holdBorder,
    },
    header: {
      backgroundColor: colors.holdHeaderBg,
      color: colors.holdText,
      borderColor: colors.holdBorder,
    },
    body: { backgroundColor: colors.holdRowBg },
    rowText: { color: colors.holdText, fontWeight: 600 },
    cellText: { color: colors.holdText },
  };
}

export function waitlistTableStyle(colors: CalendarColorTheme): {
  container: CSSProperties;
  header: CSSProperties;
  body: CSSProperties;
  rowText: CSSProperties;
  cellText: CSSProperties;
} {
  return {
    container: {
      backgroundColor: colors.waitlistRowBg,
      borderColor: colors.waitlistBorder,
    },
    header: {
      backgroundColor: colors.waitlistHeaderBg,
      color: colors.waitlistText,
      borderColor: colors.waitlistBorder,
    },
    body: { backgroundColor: colors.waitlistRowBg },
    rowText: { color: colors.waitlistText, fontWeight: 600 },
    cellText: { color: colors.waitlistText },
  };
}

export function sidebarCapacityPanelStyle(
  colors: CalendarColorTheme,
  status: DayCapacityStatus,
): CSSProperties {
  const base = dayStatusCellStyle(colors, status);
  const border = dayStatusBorderStyle(colors, status);
  return { ...base, ...border };
}
