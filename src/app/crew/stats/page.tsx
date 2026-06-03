"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewStatsScreen } from "@/components/crew-app/screens/CrewStatsScreen";

export default function CrewStatsPage() {
  return (
    <CrewAppShell title="Stats" subtitle="Your track record">
      <CrewStatsScreen />
    </CrewAppShell>
  );
}
