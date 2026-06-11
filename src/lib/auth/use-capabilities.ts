"use client";

import {
  allowedDashboardViews,
  canAccess,
  deriveCapabilities,
  defaultDashboardForLevel,
  type Capability,
  type CapabilitySet,
} from "@/lib/auth/capabilities";
import type { DashboardView } from "@/lib/dashboard/types";
import { useRoleTemplates } from "@/components/providers/RoleTemplatesProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import type { CapabilityOverrides } from "@/lib/team/types";
import { useMemo } from "react";

export type CapabilitiesContext = {
  capabilities: CapabilitySet;
  can: (cap: Capability) => boolean;
  defaultDashboardView: DashboardView;
  allowedDashboardViews: DashboardView[];
  overrides: CapabilityOverrides | undefined;
};

export function useCapabilities(): CapabilitiesContext {
  const { user } = useSession();
  const { members } = useTeamMembers();
  const { templates } = useRoleTemplates();

  return useMemo(() => {
    const member = members.find(
      (m) => m.status === "active" && m.email.toLowerCase() === user.email.toLowerCase(),
    );
    const level = member?.permissionLevel ?? user.permissionLevel;
    const overrides = member?.capabilityOverrides;
    const capabilities = deriveCapabilities(level, overrides, templates);

    return {
      capabilities,
      can: (cap: Capability) => canAccess(capabilities, cap),
      defaultDashboardView: defaultDashboardForLevel(level),
      allowedDashboardViews: allowedDashboardViews(capabilities),
      overrides,
    };
  }, [members, templates, user.email, user.permissionLevel]);
}
