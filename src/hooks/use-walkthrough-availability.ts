"use client";

import {
  defaultWalkthroughAvailability,
  readWalkthroughAvailability,
  writeWalkthroughAvailability,
  type WalkthroughAvailabilitySettings,
} from "@/lib/moves/walkthrough-availability-settings";
import { useCallback, useEffect, useState } from "react";

export function useWalkthroughAvailability(assigneeKey: string) {
  const [settings, setSettings] = useState<WalkthroughAvailabilitySettings>(() =>
    defaultWalkthroughAvailability(assigneeKey),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(readWalkthroughAvailability(assigneeKey));
    setHydrated(true);
  }, [assigneeKey]);

  const saveSettings = useCallback(
    (next: WalkthroughAvailabilitySettings) => {
      setSettings(next);
      if (hydrated) {
        writeWalkthroughAvailability(next);
      }
    },
    [hydrated],
  );

  const patchSettings = useCallback(
    (patch: Partial<WalkthroughAvailabilitySettings>) => {
      saveSettings({ ...settings, ...patch, assigneeKey });
    },
    [assigneeKey, saveSettings, settings],
  );

  return { settings, saveSettings, patchSettings, hydrated };
}
