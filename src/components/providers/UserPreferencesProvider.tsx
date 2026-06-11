"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { getOfficePersona } from "@/lib/session/personas";
import {
  readUserPreferences,
  writeUserPreferences,
  type UserPreferences,
} from "@/lib/session/user-preferences";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type UserPreferencesContextValue = {
  preferences: UserPreferences;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const persona = getOfficePersona(user.id);
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    readUserPreferences(user.id, user.name, user.email, persona.workspaceRole),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(
      readUserPreferences(user.id, user.name, user.email, persona.workspaceRole),
    );
    setHydrated(true);
  }, [user.id, user.name, user.email, persona.workspaceRole]);

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const next: UserPreferences = {
          ...prev,
          ...patch,
          outlook: patch.outlook ? { ...prev.outlook, ...patch.outlook } : prev.outlook,
          notificationPrefs: patch.notificationPrefs ?? prev.notificationPrefs,
        };
        if (patch.notificationPrefs) {
          next.notifyFollowUps = patch.notificationPrefs.follow_ups?.inApp ?? prev.notifyFollowUps;
          next.notifyDocumentActivity =
            patch.notificationPrefs.document_activity?.inApp ?? prev.notifyDocumentActivity;
        }
        if (hydrated) {
          writeUserPreferences(user.id, next);
        }
        return next;
      });
    },
    [hydrated, user.id],
  );

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
    }),
    [preferences, updatePreferences],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return ctx;
}
