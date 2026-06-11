"use client";

import { DispatchProvider } from "@/components/dispatch/DispatchProvider";
import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

import { tomorrowDateKey } from "@/lib/dispatch/collect-day-jobs";

const DispatchWorkspace = lazyNamedWorkspace(
  () => import("@/components/dispatch/DispatchWorkspace"),
  (module) => module.DispatchWorkspace,
  "Loading dispatch…",
);

export function DispatchPageClient() {
  return (
    <DispatchProvider initialDateKey={tomorrowDateKey()}>
      <DispatchWorkspace />
    </DispatchProvider>
  );
}
