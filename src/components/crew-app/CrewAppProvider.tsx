"use client";

import {
  DEFAULT_CREW_SESSION,
  readCrewAppSession,
  sessionFromDemoParams,
  writeCrewAppSession,
} from "@/lib/crew-app/session";
import type { CrewAppSession } from "@/lib/crew-app/types";
import {
  getCrewAppJob,
  jobsForCrewMember,
  mockCrewAppJobs,
} from "@/lib/crew-app/mock-jobs";
import { issuesForCrewMember } from "@/lib/crew-app/stats";
import type { CrewAppJob } from "@/lib/crew-app/types";
import type { CrewIssue } from "@/lib/operations/crew-records-types";
import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { CrewAppBrandingInit } from "./CrewAppBrandingInit";

type CrewAppContextValue = {
  session: CrewAppSession;
  setSession: (next: CrewAppSession) => void;
  myJobs: CrewAppJob[];
  myIssues: CrewIssue[];
  getJob: (id: string) => CrewAppJob | undefined;
};

const CrewAppContext = createContext<CrewAppContextValue | null>(null);

export function CrewAppProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { issues, isReady: recordsReady } = useCrewRecords();
  const [session, setSessionState] = useState<CrewAppSession>(DEFAULT_CREW_SESSION);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromUrl = sessionFromDemoParams(searchParams);
    if (fromUrl) {
      setSessionState(fromUrl);
      setHydrated(true);
      return;
    }
    setSessionState(readCrewAppSession());
    setHydrated(true);
  }, [searchParams]);

  const setSession = useCallback((next: CrewAppSession) => {
    setSessionState(next);
    writeCrewAppSession(next);
  }, []);

  const allJobs = useMemo(() => mockCrewAppJobs(), []);

  const myJobs = useMemo(() => {
    if (!hydrated) return [];
    return jobsForCrewMember(allJobs, session.crewId, session.primaryRole);
  }, [allJobs, session.crewId, session.primaryRole, hydrated]);

  const myIssues = useMemo(() => {
    if (!recordsReady) return [];
    return issuesForCrewMember(issues, session.crewId);
  }, [issues, session.crewId, recordsReady]);

  const getJob = useCallback(
    (id: string) => {
      const found = myJobs.find((j) => j.id === id);
      if (found) return found;
      const raw = getCrewAppJob(id);
      if (!raw) return undefined;
      return jobsForCrewMember([raw], session.crewId, session.primaryRole)[0];
    },
    [myJobs, session.crewId, session.primaryRole],
  );

  const value = useMemo(
    () => ({ session, setSession, myJobs, myIssues, getJob }),
    [session, setSession, myJobs, myIssues, getJob],
  );

  return (
    <CrewAppContext.Provider value={value}>
      <CrewAppBrandingInit />
      {children}
    </CrewAppContext.Provider>
  );
}

export function useCrewApp() {
  const ctx = useContext(CrewAppContext);
  if (!ctx) throw new Error("useCrewApp must be used within CrewAppProvider");
  return ctx;
}
