"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewTodayScreen } from "@/components/crew-app/screens/CrewTodayScreen";
import { formatMoveDate } from "@/lib/moves/format";
import { toDateKey } from "@/lib/calendar/date-utils";

export default function CrewTodayPage() {
  const todayKey = toDateKey(new Date());
  return (
    <CrewAppShell title="Today" subtitle={formatMoveDate(todayKey)}>
      <CrewTodayScreen />
    </CrewAppShell>
  );
}
