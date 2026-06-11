import { ROUTES } from "@/lib/navigation/routes";
import type { WalkthroughMode } from "./types";

export const WALKTHROUGH_LINK_EXPIRY_DAYS = 14;

/** How walkthrough type is set when the customer opens the link. */
export type WalkthroughLinkMode = WalkthroughMode | "customer_choice";

export type WalkthroughLinkParams = {
  moveId: string;
  assignee: string;
  mode: WalkthroughLinkMode;
};

const LINK_MODE_PARAM: Record<WalkthroughLinkMode, string> = {
  in_person: "in_person",
  virtual: "virtual",
  customer_choice: "choice",
};

const PARAM_TO_LINK_MODE: Record<string, WalkthroughLinkMode> = {
  in_person: "in_person",
  virtual: "virtual",
  choice: "customer_choice",
};

export function walkthroughLinkModeLabel(mode: WalkthroughLinkMode): string {
  if (mode === "customer_choice") return "Customer chooses in-person or virtual";
  if (mode === "virtual") return "Virtual";
  return "In person";
}

export function buildWalkthroughSchedulingPath(params: WalkthroughLinkParams): string {
  const search = new URLSearchParams({
    move: params.moveId,
    rep: params.assignee,
    mode: LINK_MODE_PARAM[params.mode],
  });
  return `${ROUTES.portalWalkthrough}?${search.toString()}`;
}

/** Absolute URL for SMS/email — pass origin in browser, or app base URL on server. */
export function buildWalkthroughSchedulingUrl(
  origin: string,
  params: WalkthroughLinkParams,
): string {
  const path = buildWalkthroughSchedulingPath(params);
  return `${origin.replace(/\/$/, "")}${path}`;
}

/** Demo move for availability preview when no live move is selected. */
export const WALKTHROUGH_PREVIEW_MOVE_ID = "mv-needs-walkthrough";

export function buildWalkthroughAvailabilityPreviewPath(
  assignee: string,
  moveId = WALKTHROUGH_PREVIEW_MOVE_ID,
): string {
  return buildWalkthroughSchedulingPath({
    moveId,
    assignee,
    mode: "customer_choice",
  });
}

export function buildWalkthroughAvailabilityPreviewUrl(
  origin: string,
  assignee: string,
  moveId = WALKTHROUGH_PREVIEW_MOVE_ID,
): string {
  const path = buildWalkthroughAvailabilityPreviewPath(assignee, moveId);
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function parseWalkthroughLinkSearchParams(
  searchParams: URLSearchParams,
): WalkthroughLinkParams | null {
  const moveId = searchParams.get("move")?.trim();
  const assignee = searchParams.get("rep")?.trim();
  if (!moveId || !assignee) return null;
  const modeRaw = searchParams.get("mode")?.trim() ?? "choice";
  const mode = PARAM_TO_LINK_MODE[modeRaw] ?? "customer_choice";
  return { moveId, assignee, mode };
}
