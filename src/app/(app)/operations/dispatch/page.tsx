"use client";

import { DispatchProvider } from "@/components/dispatch/DispatchProvider";
import { DispatchWorkspace } from "@/components/dispatch/DispatchWorkspace";
import { tomorrowDateKey } from "@/lib/dispatch/collect-day-jobs";

export default function DispatchPage() {
  return (
    <DispatchProvider initialDateKey={tomorrowDateKey()}>
      <DispatchWorkspace />
    </DispatchProvider>
  );
}
