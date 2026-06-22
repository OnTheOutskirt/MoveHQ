/** Standard commission paid to / received from a moving-company referral partner. */
export const DEFAULT_REFERRAL_COMMISSION_RATE = 0.1;

export type MovingCompanyReferral = {
  id: string;
  /** Organization id of the moving company (orgType `moving_company`). */
  organizationId: string;
  /** Customer / job that was referred. */
  customerName: string;
  /** Move date (YYYY-MM-DD) or null when unscheduled. */
  moveDate: string | null;
  /** Job revenue the commission is calculated from. */
  revenue: number;
  /** Commission rate (0.1 = 10%). */
  commissionRate: number;
  /** Whether the referral commission has been paid out. */
  paid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewMovingCompanyReferral = {
  organizationId: string;
  customerName: string;
  moveDate?: string | null;
  revenue: number;
  commissionRate?: number;
  paid?: boolean;
  notes?: string | null;
};

const STORAGE_KEY = "jm-moving-company-referrals-v1";

const SEED_REFERRALS: MovingCompanyReferral[] = [
  {
    id: "ref-seed-1",
    organizationId: "org-a-better-tripp",
    customerName: "Walsh family",
    moveDate: "2026-06-08",
    revenue: 4200,
    commissionRate: DEFAULT_REFERRAL_COMMISSION_RATE,
    paid: true,
    notes: "Referred 3BR local move",
    createdAt: "2026-06-08T00:00:00Z",
    updatedAt: "2026-06-12T00:00:00Z",
  },
  {
    id: "ref-seed-2",
    organizationId: "org-frontier-moving",
    customerName: "Delgado long-distance",
    moveDate: "2026-06-14",
    revenue: 8600,
    commissionRate: DEFAULT_REFERRAL_COMMISSION_RATE,
    paid: false,
    notes: "Overflow capacity referral",
    createdAt: "2026-06-14T00:00:00Z",
    updatedAt: "2026-06-14T00:00:00Z",
  },
];

export function generateReferralId(): string {
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read(): MovingCompanyReferral[] {
  if (typeof window === "undefined") return SEED_REFERRALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REFERRALS));
      return SEED_REFERRALS;
    }
    const parsed = JSON.parse(raw) as MovingCompanyReferral[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(referrals: MovingCompanyReferral[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
}

export function listMovingCompanyReferrals(): MovingCompanyReferral[] {
  return read().sort((a, b) => (b.moveDate ?? b.createdAt).localeCompare(a.moveDate ?? a.createdAt));
}

export function addMovingCompanyReferral(input: NewMovingCompanyReferral): MovingCompanyReferral {
  const now = new Date().toISOString();
  const record: MovingCompanyReferral = {
    id: generateReferralId(),
    organizationId: input.organizationId,
    customerName: input.customerName.trim(),
    moveDate: input.moveDate ?? null,
    revenue: Math.max(0, input.revenue),
    commissionRate: input.commissionRate ?? DEFAULT_REFERRAL_COMMISSION_RATE,
    paid: input.paid ?? false,
    notes: input.notes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
  write([record, ...read()]);
  return record;
}

export function updateMovingCompanyReferral(
  id: string,
  patch: Partial<Omit<MovingCompanyReferral, "id" | "createdAt">>,
): void {
  write(
    read().map((referral) =>
      referral.id === id
        ? { ...referral, ...patch, updatedAt: new Date().toISOString() }
        : referral,
    ),
  );
}

export function removeMovingCompanyReferral(id: string): void {
  write(read().filter((referral) => referral.id !== id));
}

export function referralCommission(referral: MovingCompanyReferral): number {
  return Math.round(referral.revenue * referral.commissionRate * 100) / 100;
}
