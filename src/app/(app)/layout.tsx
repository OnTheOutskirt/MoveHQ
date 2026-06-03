import { AppShell } from "@/components/layout/AppShell";
import { InboxProvider } from "@/components/providers/InboxProvider";
import { MovesProvider } from "@/components/moves/MovesProvider";
import { CalendarSettingsProvider } from "@/components/providers/CalendarSettingsProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { FleetProvider } from "@/components/providers/FleetProvider";
import { ChangeOrdersProvider } from "@/components/providers/ChangeOrdersProvider";
import { ClaimsProvider } from "@/components/providers/ClaimsProvider";
import { CrewRecordsProvider } from "@/components/providers/CrewRecordsProvider";
import { TeamMembersProvider } from "@/components/providers/TeamMembersProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <TeamMembersProvider>
        <FleetProvider>
          <CrewRecordsProvider>
            <ChangeOrdersProvider>
            <ClaimsProvider>
              <CalendarSettingsProvider>
                <MovesProvider>
                  <InboxProvider>
                    <AppShell>{children}</AppShell>
                  </InboxProvider>
                </MovesProvider>
              </CalendarSettingsProvider>
            </ClaimsProvider>
            </ChangeOrdersProvider>
          </CrewRecordsProvider>
        </FleetProvider>
      </TeamMembersProvider>
    </SettingsProvider>
  );
}
