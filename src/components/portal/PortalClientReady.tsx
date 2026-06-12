"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { useEffect, useState, type ReactNode } from "react";

type PortalClientReadyProps = {
  children: ReactNode;
};

/**
 * Portal routes read branding and moves from browser storage. Defer rendering
 * until after mount so SSR markup matches the first client paint.
 */
export function PortalClientReady({ children }: PortalClientReadyProps) {
  const { isReady } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  return children;
}
