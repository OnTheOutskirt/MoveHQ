"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewScheduleScreen } from "@/components/crew-app/screens/CrewScheduleScreen";

export default function CrewSchedulePage() {
  return (
    <CrewAppShell title="Schedule" subtitle="Upcoming published days">
      <CrewScheduleScreen />
    </CrewAppShell>
  );
}
