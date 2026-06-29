import type { ReferralTouch } from "./types";

const STORAGE_KEY = "jm-referral-touches-v1";

export function generateReferralTouchId(): string {
  return `rt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_REFERRAL_TOUCHES: ReferralTouch[] = [
  {
    id: "rt-demo-1",
    partnerType: "organization",
    partnerId: "org-whitfield-realty",
    touchType: "thank_you_text",
    date: "2026-05-19",
    notes: "Texted Karen after Chen family close — thanked her for the referral and confirmed keys handed off.",
    moveId: "mv-complete-2day",
    loggedBy: "Mia Chen",
    createdAt: "2026-05-19T18:00:00Z",
  },
  {
    id: "rt-demo-2",
    partnerType: "person",
    partnerId: "person-karen-whitfield",
    touchType: "gift",
    date: "2026-05-22",
    notes: "Sent closing gift basket to Whitfield office — team loved the branded cooler.",
    giftValue: 85,
    moveId: "mv-quote-sent",
    loggedBy: "Sarah Kim",
    createdAt: "2026-05-22T14:30:00Z",
  },
  {
    id: "rt-demo-3",
    partnerType: "organization",
    partnerId: "org-sunset-senior",
    touchType: "lunch",
    date: "2026-05-10",
    notes: "Lunch with transitions coordinator — discussed summer move volume and COI renewal.",
    loggedBy: "Alex Rivera",
    createdAt: "2026-05-10T19:00:00Z",
  },
  {
    id: "rt-demo-4",
    partnerType: "person",
    partnerId: "person-sunset-coordinator",
    touchType: "call",
    date: "2026-06-01",
    notes: "Quarterly check-in — they have 3 resident moves likely in July.",
    loggedBy: "Mia Chen",
    createdAt: "2026-06-01T16:00:00Z",
  },
];

export function loadReferralTouches(): ReferralTouch[] {
  if (typeof window === "undefined") return [...DEFAULT_REFERRAL_TOUCHES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_REFERRAL_TOUCHES];
    const parsed = JSON.parse(raw) as ReferralTouch[];
    return Array.isArray(parsed) ? parsed : [...DEFAULT_REFERRAL_TOUCHES];
  } catch {
    return [...DEFAULT_REFERRAL_TOUCHES];
  }
}

export function saveReferralTouches(touches: ReferralTouch[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(touches));
}

/** Repoint all touches for a partner from one id to another (merge). */
export function reassignReferralTouches(
  partnerType: ReferralTouch["partnerType"],
  fromPartnerId: string,
  toPartnerId: string,
): void {
  const touches = loadReferralTouches();
  let changed = false;
  const next = touches.map((touch) => {
    if (touch.partnerType === partnerType && touch.partnerId === fromPartnerId) {
      changed = true;
      return { ...touch, partnerId: toPartnerId };
    }
    return touch;
  });
  if (changed) saveReferralTouches(next);
}
