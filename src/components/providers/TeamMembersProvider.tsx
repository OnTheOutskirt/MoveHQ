"use client";

import { defaultTeamMembers } from "@/lib/team/defaults";
import { generateMemberId, loadTeamMembers, saveTeamMembers } from "@/lib/team/storage";
import type { TeamMemberFormData, TeamMemberRecord } from "@/lib/team/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TeamMembersContextValue = {
  members: TeamMemberRecord[];
  addMember: (data: TeamMemberFormData) => TeamMemberRecord;
  updateMember: (id: string, data: TeamMemberFormData) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => TeamMemberRecord | undefined;
  resetMembers: () => void;
  isReady: boolean;
};

const TeamMembersContext = createContext<TeamMembersContextValue | null>(null);

export function TeamMembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<TeamMemberRecord[]>(defaultTeamMembers);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMembers(loadTeamMembers());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: TeamMemberRecord[]) => {
    setMembers(next);
    saveTeamMembers(next);
  }, []);

  const addMember = useCallback(
    (data: TeamMemberFormData) => {
      const record: TeamMemberRecord = { ...data, id: generateMemberId() };
      setMembers((prev) => {
        const next = [...prev, record];
        saveTeamMembers(next);
        return next;
      });
      return record;
    },
    [],
  );

  const updateMember = useCallback((id: string, data: TeamMemberFormData) => {
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...data, id } : m));
      saveTeamMembers(next);
      return next;
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveTeamMembers(next);
      return next;
    });
  }, []);

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members],
  );

  const resetMembers = useCallback(() => {
    persist(defaultTeamMembers);
  }, [persist]);

  const value = useMemo(
    () => ({
      members,
      addMember,
      updateMember,
      removeMember,
      getMember,
      resetMembers,
      isReady,
    }),
    [members, addMember, updateMember, removeMember, getMember, resetMembers, isReady],
  );

  return <TeamMembersContext.Provider value={value}>{children}</TeamMembersContext.Provider>;
}

export function useTeamMembers() {
  const ctx = useContext(TeamMembersContext);
  if (!ctx) throw new Error("useTeamMembers must be used within TeamMembersProvider");
  return ctx;
}
