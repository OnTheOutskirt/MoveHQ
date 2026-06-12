"use client";

import { useEffect, useState } from "react";

/** True after the first client paint — use to defer browser-only UI (counts, storage-backed labels). */
export function useClientHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
