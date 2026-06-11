"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";

/** Avoid mounting route pages until core shell data is hydrated (one pass, not N provider flashes). */
export function AppContentGate({ children }: { children: React.ReactNode }) {
  const { isReady: settingsReady } = useSettings();
  const { isHydrated: sessionReady } = useSession();
  const { isReady: workspaceReady } = useWorkspace();

  if (!settingsReady || !sessionReady || !workspaceReady) {
    return <PageLoadingFallback label="Loading workspace…" />;
  }

  return children;
}
