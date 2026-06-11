"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewScheduleHistoryScreen } from "@/components/crew-app/screens/CrewScheduleHistoryScreen";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  crewScheduleTodayKey,
  weekStartKeyForDate,
} from "@/lib/crew-app/crew-history";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function CrewScheduleHistoryPageInner() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const weekStartsOn = settings.company.weekStartsOn ?? "monday";

  const weekStartKey = useMemo(() => {
    const param = searchParams.get("week");
    if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) return param;
    return weekStartKeyForDate(crewScheduleTodayKey(), weekStartsOn);
  }, [searchParams, weekStartsOn]);

  return <CrewScheduleHistoryScreen weekStartKey={weekStartKey} />;
}

export default function CrewScheduleHistoryPage() {
  return (
    <CrewAppShell title="Week details" subtitle="Jobs, time & tips" hideNav>
      <Suspense
        fallback={<p className="text-sm text-slate-500">Loading week…</p>}
      >
        <CrewScheduleHistoryPageInner />
      </Suspense>
    </CrewAppShell>
  );
}
