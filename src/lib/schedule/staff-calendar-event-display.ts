import type { StaffCalendarEvent, StaffCalendarEventKind } from "./types";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  MapPin,
  Phone,
  Users,
  Video,
} from "lucide-react";

const KIND_META: Record<
  StaffCalendarEventKind,
  { label: string; icon: LucideIcon }
> = {
  walkthrough_in_person: { label: "In-person walkthrough", icon: MapPin },
  walkthrough_virtual: { label: "Virtual walkthrough", icon: Video },
  estimate_virtual: { label: "Virtual estimate", icon: Video },
  meeting: { label: "Meeting", icon: Users },
  standup: { label: "Standup", icon: Users },
  call: { label: "Call", icon: Phone },
  other: { label: "Event", icon: Calendar },
};

export function resolveStaffCalendarEventKind(
  event: StaffCalendarEvent,
): StaffCalendarEventKind {
  if (event.kind) return event.kind;

  const title = event.title.toLowerCase();
  const location = event.location?.toLowerCase() ?? "";

  if (event.moveId || title.includes("walkthrough")) {
    if (title.includes("virtual") || location.includes("video")) {
      return "walkthrough_virtual";
    }
    return "walkthrough_in_person";
  }
  if (title.includes("virtual estimate") || title.includes("virtual")) {
    return "estimate_virtual";
  }
  if (title.includes("standup") || title.includes("huddle")) {
    return "standup";
  }
  if (title.includes("call") || title.includes("phone")) {
    return "call";
  }
  if (
    title.includes("lunch") ||
    title.includes("meeting") ||
    title.includes("review") ||
    title.includes("all-hands") ||
    title.includes("check-in")
  ) {
    return "meeting";
  }
  return "other";
}

export function staffCalendarEventKindLabel(kind: StaffCalendarEventKind): string {
  return KIND_META[kind].label;
}

export function staffCalendarEventKindIcon(kind: StaffCalendarEventKind): LucideIcon {
  return KIND_META[kind].icon;
}
