export type ReferralPartnerType = "person" | "organization";

export type ReferralPartnerKey = `${ReferralPartnerType}:${string}`;

export function referralPartnerKey(
  type: ReferralPartnerType,
  id: string,
): ReferralPartnerKey {
  return `${type}:${id}`;
}

export function parseReferralPartnerKey(key: ReferralPartnerKey): {
  type: ReferralPartnerType;
  id: string;
} {
  const [type, ...rest] = key.split(":");
  return { type: type as ReferralPartnerType, id: rest.join(":") };
}

export const REFERRAL_TOUCH_TYPES = [
  "thank_you_text",
  "thank_you_email",
  "gift",
  "lunch",
  "call",
  "note",
] as const;

export type ReferralTouchType = (typeof REFERRAL_TOUCH_TYPES)[number];

export const REFERRAL_TOUCH_TYPE_LABELS: Record<ReferralTouchType, string> = {
  thank_you_text: "Thank-you text",
  thank_you_email: "Thank-you email",
  gift: "Gift sent",
  lunch: "Lunch / coffee",
  call: "Check-in call",
  note: "Relationship note",
};

export type ReferralTouch = {
  id: string;
  partnerType: ReferralPartnerType;
  partnerId: string;
  touchType: ReferralTouchType;
  /** ISO date yyyy-mm-dd */
  date: string;
  notes: string;
  giftValue?: number;
  moveId?: string;
  loggedBy?: string;
  createdAt: string;
};

export type ReferralPartnerCategory =
  | "realtor"
  | "senior_living"
  | "business"
  | "other";

export type ReferralPartnerStats = {
  key: ReferralPartnerKey;
  partnerType: ReferralPartnerType;
  partnerId: string;
  name: string;
  subtitle?: string;
  organizationName?: string;
  organizationId?: string;
  category: ReferralPartnerCategory;
  referralCount: number;
  bookedCount: number;
  completedCount: number;
  revenueTotal: number;
  lastReferralDate?: string;
};

export type NewReferralTouch = Omit<ReferralTouch, "id" | "createdAt">;
