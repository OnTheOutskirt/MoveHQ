import {
  expandSlotPillLabels,
  formatSlotCode,
  formatSlotList,
  formatSlotReadable,
  slotTypeCode,
} from "@/lib/day-share/labels";
import type { FtaDuration, FtaPeriod, FtaSlot } from "./types";

/** @deprecated Use slotTypeCode from day-share */
export function ftaCode(period: FtaPeriod, duration: FtaDuration): string {
  return slotTypeCode(period, duration);
}

/** e.g. (1)2As — one two-person afternoon short open slot */
export function formatFtaSlot(slot: FtaSlot): string {
  return formatSlotCode(slot);
}

export function formatFtaList(ftas: FtaSlot[]): string {
  return formatSlotList(ftas);
}

export function formatFtaSlotReadable(slot: FtaSlot): string {
  return formatSlotReadable(slot);
}

/** One pill label per open slot unit (matches month-view count). */
export function expandFtaPillLabels(ftas: FtaSlot[]): string[] {
  return expandSlotPillLabels(ftas);
}
