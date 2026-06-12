import {
  buildWalkthroughShareFillContext,
  fillWalkthroughShareEmail,
  fillWalkthroughShareSms,
  type WalkthroughShareKind,
} from "@/lib/communications/walkthrough-share-templates";
import { formatMoveDate } from "@/lib/moves/format";
import { buildWalkthroughCancelUrl } from "@/lib/moves/walkthrough-scheduling-link";
import {
  formatWalkthroughMode,
  resolveMoveWalkthrough,
} from "@/lib/moves/walkthroughs";
import { ROUTES } from "@/lib/navigation/routes";
import type { MoveRecord } from "./types";

export type { WalkthroughShareKind };

/** Customer self-film via LiveSwitch — no rep on the link. */
export function buildLiveSwitchSelfFilmPath(moveId: string): string {
  const search = new URLSearchParams({ move: moveId });
  return `${ROUTES.portalWalkthrough}/film?${search.toString()}`;
}

export function buildLiveSwitchSelfFilmUrl(origin: string, moveId: string): string {
  const path = buildLiveSwitchSelfFilmPath(moveId);
  return `${origin.replace(/\/$/, "")}${path}`;
}

const LIVESWITCH_REP_MEETING_BASE = "https://demo.liveswitch.io/jm-walkthrough";

/** Live rep-led virtual walkthrough (booked on calendar). */
export function buildLiveSwitchRepMeetingUrl(moveId: string, assignee: string): string {
  const search = new URLSearchParams({ move: moveId, rep: assignee });
  return `${LIVESWITCH_REP_MEETING_BASE}?${search.toString()}`;
}

export function buildVirtualWalkthroughMeetingUrl(
  origin: string,
  moveId: string,
  assignee: string,
  scheduledDate: string,
  startTime: string,
): string {
  const search = new URLSearchParams({
    move: moveId,
    rep: assignee,
    date: scheduledDate,
    time: startTime,
  });
  return `${origin.replace(/\/$/, "")}/portal/walkthrough/meet?${search.toString()}`;
}

export function customerFirstName(move: MoveRecord): string {
  return move.customerName.split("(")[0]?.trim() || move.customerName;
}

function walkthroughShareContext(
  move: MoveRecord,
  linkUrl: string,
  assignee?: string,
  slotLabel?: string,
  extra?: {
    cancelLinkUrl?: string;
    walkthroughMode?: "in_person" | "virtual";
    walkthroughLocation?: string;
  },
) {
  return buildWalkthroughShareFillContext({
    customerName: move.customerName,
    preferredDate: move.preferredDate,
    linkUrl,
    assignee,
    slotLabel,
    cancelLinkUrl: extra?.cancelLinkUrl,
    walkthroughMode: extra?.walkthroughMode,
    walkthroughLocation: extra?.walkthroughLocation,
  });
}

export function buildWalkthroughConfirmationCancelUrl(
  origin: string,
  moveId: string,
): string {
  return buildWalkthroughCancelUrl(origin, { moveId });
}

export function walkthroughConfirmationSlotLabel(
  scheduledDate: string,
  startTime: string,
): string {
  return `${formatMoveDate(scheduledDate)} at ${startTime}`;
}

export function walkthroughConfirmationShareLinks(
  origin: string,
  move: MoveRecord,
): { cancelUrl: string; slotLabel: string; assignee: string } | null {
  const wt = resolveMoveWalkthrough(move);
  if (!wt || wt.status !== "scheduled") return null;
  return {
    cancelUrl: buildWalkthroughConfirmationCancelUrl(origin, move.id),
    slotLabel: walkthroughConfirmationSlotLabel(wt.scheduledDate, wt.startTime),
    assignee: wt.assignedTo,
  };
}

export function walkthroughShareEmailSubject(
  kind: WalkthroughShareKind,
  move: MoveRecord,
  linkUrl = "",
  assignee?: string,
  slotLabel?: string,
  extra?: Parameters<typeof walkthroughShareContext>[4],
): string {
  return fillWalkthroughShareEmail(
    kind,
    walkthroughShareContext(move, linkUrl, assignee, slotLabel, extra),
  ).subject;
}

export function walkthroughShareEmailBody(
  kind: WalkthroughShareKind,
  move: MoveRecord,
  linkUrl: string,
  assignee?: string,
  slotLabel?: string,
  extra?: Parameters<typeof walkthroughShareContext>[4],
): string {
  return fillWalkthroughShareEmail(
    kind,
    walkthroughShareContext(move, linkUrl, assignee, slotLabel, extra),
  ).body;
}

export function walkthroughShareSmsBody(
  kind: WalkthroughShareKind,
  move: MoveRecord,
  linkUrl: string,
  assignee?: string,
  slotLabel?: string,
  extra?: Parameters<typeof walkthroughShareContext>[4],
): string {
  return fillWalkthroughShareSms(
    kind,
    walkthroughShareContext(move, linkUrl, assignee, slotLabel, extra),
  );
}

export function walkthroughShareActivityLabel(kind: WalkthroughShareKind): string {
  switch (kind) {
    case "scheduling":
      return "Scheduling link";
    case "virtual_meeting":
      return "Virtual meeting link";
    case "liveswitch":
      return "LiveSwitch self-film link";
    case "confirmation":
      return "Walkthrough confirmation";
    default:
      return "Walkthrough link";
  }
}

export function walkthroughUsesInlineComposer(kind: WalkthroughShareKind): boolean {
  return (
    kind === "scheduling" ||
    kind === "liveswitch" ||
    kind === "virtual_meeting" ||
    kind === "confirmation"
  );
}
