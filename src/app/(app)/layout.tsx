import { AppContentGate } from "@/components/layout/AppContentGate";
import { AppShell } from "@/components/layout/AppShell";
import { InboxProvider } from "@/components/providers/InboxProvider";
import { UserPreferencesProvider } from "@/components/providers/UserPreferencesProvider";
import { MovesProvider } from "@/components/moves/MovesProvider";
import { ReferralPartnersProvider } from "@/components/providers/ReferralPartnersProvider";
import { CalendarPlacementProvider } from "@/components/providers/CalendarPlacementProvider";
import { CalendarSettingsProvider } from "@/components/providers/CalendarSettingsProvider";
import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import { EquipmentCatalogProvider } from "@/components/providers/EquipmentCatalogProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { FleetProvider } from "@/components/providers/FleetProvider";
import { ChangeOrdersProvider } from "@/components/providers/ChangeOrdersProvider";
import { ClaimsProvider } from "@/components/providers/ClaimsProvider";
import { CrewRecordsProvider } from "@/components/providers/CrewRecordsProvider";
import { InventoryProvider } from "@/components/providers/InventoryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { RoleTemplatesProvider } from "@/components/providers/RoleTemplatesProvider";
import { EmployeeHrDocsProvider } from "@/components/providers/EmployeeHrDocsProvider";
import { TeamMembersProvider } from "@/components/providers/TeamMembersProvider";
import { TesterFeedbackProvider } from "@/components/providers/TesterFeedbackProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <EquipmentCatalogProvider>
        <SessionProvider>
          <TesterFeedbackProvider>
          <TeamMembersProvider>
            <EmployeeHrDocsProvider>
            <RoleTemplatesProvider>
              <WorkspaceProvider>
                <InventoryProvider>
                  <FleetProvider>
                    <CrewRecordsProvider>
                      <ChangeOrdersProvider>
                        <ClaimsProvider>
                          <CalendarSettingsProvider>
                            <CalendarPlacementProvider>
                              <MovesProvider>
                                <ReferralPartnersProvider>
                                <InboxProvider>
                                  <UserPreferencesProvider>
                                    <AppShell>
                                      <AppContentGate>{children}</AppContentGate>
                                    </AppShell>
                                  </UserPreferencesProvider>
                                </InboxProvider>
                                </ReferralPartnersProvider>
                              </MovesProvider>
                            </CalendarPlacementProvider>
                          </CalendarSettingsProvider>
                        </ClaimsProvider>
                      </ChangeOrdersProvider>
                    </CrewRecordsProvider>
                  </FleetProvider>
                </InventoryProvider>
              </WorkspaceProvider>
            </RoleTemplatesProvider>
            </EmployeeHrDocsProvider>
          </TeamMembersProvider>
          </TesterFeedbackProvider>
        </SessionProvider>
      </EquipmentCatalogProvider>
    </SettingsProvider>
  );
}
