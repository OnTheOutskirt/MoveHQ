"use client";

import {
  getOfficePersona,
  REAL_ADMIN_PERSONA,
  type OfficePersona,
  type OfficePersonaId,
} from "@/lib/session/personas";
import { readActivePersonaId, writeActivePersonaId } from "@/lib/session/session-storage";
import type { UserWorkspaceMembership } from "@/lib/workspace/types";
import { DEMO_WORKSPACE_MEMBERSHIP } from "@/lib/workspace/membership";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SessionContextValue = {
  user: OfficePersona;
  /** Workspace membership derived from active persona (demo until auth). */
  workspace: UserWorkspaceMembership;
  isHydrated: boolean;
  /** Signed-in admin account — persists across persona switches */
  realAdmin: OfficePersona;
  isViewingAsOtherRole: boolean;
  switchPersona: (id: OfficePersonaId) => void;
  resetPersona: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function membershipForPersona(persona: OfficePersona): UserWorkspaceMembership {
  return {
    ...DEMO_WORKSPACE_MEMBERSHIP,
    role: persona.workspaceRole,
    primaryLocationId: DEMO_WORKSPACE_MEMBERSHIP.primaryLocationId,
    locationAccess:
      persona.workspaceRole === "owner" ||
      persona.workspaceRole === "admin" ||
      persona.workspaceRole === "manager"
        ? "all"
        : DEMO_WORKSPACE_MEMBERSHIP.locationAccess,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OfficePersona>(() => REAL_ADMIN_PERSONA);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = getOfficePersona(readActivePersonaId());
    setUser((prev) => (prev.id === loaded.id ? prev : loaded));
    setIsHydrated(true);
  }, []);

  const switchPersona = useCallback((id: OfficePersonaId) => {
    const next = getOfficePersona(id);
    setUser(next);
    writeActivePersonaId(id);
  }, []);

  const resetPersona = useCallback(() => {
    setUser(REAL_ADMIN_PERSONA);
    writeActivePersonaId(REAL_ADMIN_PERSONA.id);
  }, []);

  const workspace = useMemo(
    () => membershipForPersona(user),
    [user.id, user.workspaceRole],
  );

  const value = useMemo(
    () => ({
      user,
      workspace,
      isHydrated,
      realAdmin: REAL_ADMIN_PERSONA,
      isViewingAsOtherRole: user.id !== REAL_ADMIN_PERSONA.id,
      switchPersona,
      resetPersona,
    }),
    [user, workspace, isHydrated, switchPersona, resetPersona],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
