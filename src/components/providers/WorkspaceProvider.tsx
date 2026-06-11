"use client";

import {
  loadActiveLocationScope,
  saveActiveLocationScope,
} from "@/lib/workspace/active-context";
import {
  allowedLocationIds,
  canViewAllLocations,
  locationIdForNewRecords,
  resolveActiveScope,
} from "@/lib/workspace/access";
import { ALL_LOCATIONS_SCOPE } from "@/lib/workspace/constants";
import { defaultWorkspaceConfig } from "@/lib/workspace/defaults";
import { filterByLocationScope, isAllLocationsScope } from "@/lib/workspace/scope";
import {
  loadWorkspaceConfig,
  saveWorkspaceConfig,
  workspaceSnapshot,
} from "@/lib/workspace/storage";
import type {
  ActiveLocationScope,
  UserWorkspaceMembership,
  WorkspaceConfig,
  WorkspaceLocation,
} from "@/lib/workspace/types";
import { useRoleTemplates } from "@/components/providers/RoleTemplatesProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { membershipFromTeamMember } from "@/lib/team/membership";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WorkspaceContextValue = {
  isReady: boolean;
  config: WorkspaceConfig;
  membership: UserWorkspaceMembership;
  activeScope: ActiveLocationScope;
  activeLocation: WorkspaceLocation | null;
  allowedLocations: WorkspaceLocation[];
  canUseAllLocations: boolean;
  isAllLocationsView: boolean;
  hasMultipleLocations: boolean;
  setActiveScope: (scope: ActiveLocationScope) => void;
  updateConfig: (config: WorkspaceConfig) => void;
  getLocationById: (id: string) => WorkspaceLocation | undefined;
  locationLabel: (locationId: string) => string;
  locationIdForNewRecords: () => string;
  filterByActiveScope: <T extends { locationId?: string }>(items: T[]) => T[];
  allowedLocationIdList: string[];
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, workspace: personaMembership } = useSession();
  const { members } = useTeamMembers();
  const { locationDefaultForLevel } = useRoleTemplates();

  const membership = useMemo(() => {
    const member = members.find(
      (m) => m.status === "active" && m.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (!member) return personaMembership;
    return membershipFromTeamMember(
      member,
      user,
      locationDefaultForLevel(member.permissionLevel),
    );
  }, [members, user, personaMembership, locationDefaultForLevel]);

  const membershipRole = membership.role;
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState<WorkspaceConfig>(() => defaultWorkspaceConfig());
  const [activeScope, setActiveScopeState] = useState<ActiveLocationScope>(
    membership.primaryLocationId,
  );

  useEffect(() => {
    const loaded = loadWorkspaceConfig();
    setConfig(loaded);
    const stored = loadActiveLocationScope(user.id);
    const allowed = allowedLocationIds(membership, loaded.locations);
    const resolved = resolveActiveScope(
      stored ?? membership.primaryLocationId,
      membership,
      loaded.locations,
    );
    setActiveScopeState(resolved);
    setIsReady(true);
  }, [
    membershipRole,
    membership.primaryLocationId,
    membership.locationAccess,
    user.id,
    config.locations.length,
  ]);

  useEffect(() => {
    if (!isReady) return;
    const activeCount = config.locations.filter((l) => l.status !== "inactive").length;
    if (activeCount > 1) return;
    const primary =
      config.locations.find((l) => l.isPrimary)?.id ?? config.locations[0]?.id;
    if (primary && activeScope !== primary) {
      setActiveScopeState(primary);
      saveActiveLocationScope(user.id, primary);
    }
  }, [isReady, config.locations, activeScope, user.id]);

  const allowedLocations = useMemo(() => {
    const ids = new Set(allowedLocationIds(membership, config.locations));
    return config.locations.filter((l) => ids.has(l.id));
  }, [config.locations, membership]);

  const allowedLocationIdList = useMemo(
    () => allowedLocations.map((l) => l.id),
    [allowedLocations],
  );

  const activeLocations = useMemo(
    () => config.locations.filter((l) => l.status !== "inactive"),
    [config.locations],
  );

  const hasMultipleLocations = activeLocations.length > 1;

  const canUseAllLocations = canViewAllLocations(membership);
  const isAllLocationsView = isAllLocationsScope(activeScope);

  const activeLocation = useMemo(() => {
    if (isAllLocationsView) return null;
    return config.locations.find((l) => l.id === activeScope) ?? null;
  }, [activeScope, config.locations, isAllLocationsView]);

  const setActiveScope = useCallback(
    (scope: ActiveLocationScope) => {
      const resolved = resolveActiveScope(scope, membership, config.locations);
      setActiveScopeState(resolved);
      saveActiveLocationScope(user.id, resolved);
    },
    [config.locations, membership, user.id],
  );

  const updateConfig = useCallback((next: WorkspaceConfig) => {
    setConfig(next);
    saveWorkspaceConfig(next);
    const resolved = resolveActiveScope(activeScope, membership, next.locations);
    if (resolved !== activeScope) {
      setActiveScopeState(resolved);
      saveActiveLocationScope(user.id, resolved);
    }
  }, [activeScope, membership, user.id]);

  const getLocationById = useCallback(
    (id: string) => config.locations.find((l) => l.id === id),
    [config.locations],
  );

  const locationLabel = useCallback(
    (locationId: string) => getLocationById(locationId)?.name ?? "Location",
    [getLocationById],
  );

  const filterByActiveScope = useCallback(
    <T extends { locationId?: string }>(items: T[]) =>
      filterByLocationScope(items, activeScope, allowedLocationIdList),
    [activeScope, allowedLocationIdList],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      isReady,
      config,
      membership,
      activeScope,
      activeLocation,
      allowedLocations,
      canUseAllLocations,
      isAllLocationsView,
      hasMultipleLocations,
      setActiveScope,
      updateConfig,
      getLocationById,
      locationLabel,
      locationIdForNewRecords: () => locationIdForNewRecords(activeScope, membership),
      filterByActiveScope,
      allowedLocationIdList,
    }),
    [
      isReady,
      config,
      membership,
      activeScope,
      activeLocation,
      allowedLocations,
      canUseAllLocations,
      isAllLocationsView,
      hasMultipleLocations,
      setActiveScope,
      updateConfig,
      getLocationById,
      locationLabel,
      filterByActiveScope,
      allowedLocationIdList,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export { ALL_LOCATIONS_SCOPE, workspaceSnapshot };
