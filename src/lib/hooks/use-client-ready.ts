"use client";

import { useEffect, useState } from "react";

/** True after mount — use to defer browser-only or time-sensitive UI during SSR hydration. */
export function useClientReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
