"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { collectReferralPartnerStats } from "@/lib/referrals/referral-metrics";
import {
  DEFAULT_REFERRAL_TOUCHES,
  generateReferralTouchId,
  loadReferralTouches,
  saveReferralTouches,
} from "@/lib/referrals/touch-log-storage";
import type { NewReferralTouch, ReferralPartnerStats, ReferralTouch } from "@/lib/referrals/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ReferralPartnersContextValue = {
  isReady: boolean;
  stats: ReferralPartnerStats[];
  touches: ReferralTouch[];
  touchesForPartner: (partnerType: ReferralTouch["partnerType"], partnerId: string) => ReferralTouch[];
  addTouch: (input: NewReferralTouch) => ReferralTouch;
  resetTouches: () => void;
};

const ReferralPartnersContext = createContext<ReferralPartnersContextValue | null>(null);

export function ReferralPartnersProvider({ children }: { children: ReactNode }) {
  const { moves } = useMoves();
  const [touches, setTouches] = useState<ReferralTouch[]>(DEFAULT_REFERRAL_TOUCHES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTouches(loadReferralTouches());
    setIsReady(true);
  }, []);

  const stats = useMemo(() => collectReferralPartnerStats(moves), [moves]);

  const touchesForPartner = useCallback(
    (partnerType: ReferralTouch["partnerType"], partnerId: string) =>
      touches
        .filter((t) => t.partnerType === partnerType && t.partnerId === partnerId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [touches],
  );

  const addTouch = useCallback(
    (input: NewReferralTouch) => {
      const touch: ReferralTouch = {
        ...input,
        id: generateReferralTouchId(),
        createdAt: new Date().toISOString(),
      };
      setTouches((prev) => {
        const next = [touch, ...prev];
        saveReferralTouches(next);
        return next;
      });
      return touch;
    },
    [],
  );

  const resetTouches = useCallback(() => {
    const next = [...DEFAULT_REFERRAL_TOUCHES];
    setTouches(next);
    saveReferralTouches(next);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      stats,
      touches,
      touchesForPartner,
      addTouch,
      resetTouches,
    }),
    [isReady, stats, touches, touchesForPartner, addTouch, resetTouches],
  );

  return (
    <ReferralPartnersContext.Provider value={value}>{children}</ReferralPartnersContext.Provider>
  );
}

export function useReferralPartners() {
  const ctx = useContext(ReferralPartnersContext);
  if (!ctx) throw new Error("useReferralPartners must be used within ReferralPartnersProvider");
  return ctx;
}
