"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewTodayScreen } from "@/components/crew-app/screens/CrewTodayScreen";
import { crewScheduleTodayKey } from "@/lib/crew-app/crew-history";
import { formatMoveDate } from "@/lib/moves/format";

export default function CrewTodayPage() {
  return (
    <CrewAppShell title="Today" subtitle={formatMoveDate(crewScheduleTodayKey())}>
      <CrewTodayScreen />
    </CrewAppShell>
  );
}
