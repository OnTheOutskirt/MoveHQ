"use client";

import {
  DEFAULT_CREW_SESSION,
  readCrewAppSession,
  sessionFromDemoParams,
  writeCrewAppSession,
} from "@/lib/crew-app/session";
import type { CrewAppSession } from "@/lib/crew-app/types";
import { crewAppPath } from "@/lib/crew-app/crew-path";
import {
  getCrewAppJob,
  jobsForCrewMember,
  mockCrewAppJobs,
} from "@/lib/crew-app/mock-jobs";
import {
  readCrewInbox,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
  type CrewInboxNotification,
  type CrewTimeOffRequest,
} from "@/lib/crew-app/crew-inbox-storage";
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

type CrewInboxState = {
  timeOffRequests: CrewTimeOffRequest[];
  notifications: CrewInboxNotification[];
  unreadCount: number;
};

type CrewAppContextValue = {
  /** Session + jobs loaded from URL / localStorage (avoids SSR/client mismatch). */
  isClientReady: boolean;
  session: CrewAppSession;
  setSession: (next: CrewAppSession) => void;
  myJobs: CrewAppJob[];
  myIssues: CrewIssue[];
  getJob: (id: string) => CrewAppJob | undefined;
  crewPath: (pathname: string) => string;
  inbox: CrewInboxState;
  refreshInbox: (opts?: { markReadId?: string; markAllRead?: boolean }) => void;
  loadChecklistRevision: number;
  bumpLoadChecklist: () => void;
};

const CrewAppContext = createContext<CrewAppContextValue | null>(null);

export function CrewAppProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { issues, isReady: recordsReady } = useCrewRecords();
  const [session, setSessionState] = useState<CrewAppSession>(DEFAULT_CREW_SESSION);
  const [hydrated, setHydrated] = useState(false);
  const [inbox, setInbox] = useState<CrewInboxState>({
    timeOffRequests: [],
    notifications: [],
    unreadCount: 0,
  });
  const [loadChecklistRevision, setLoadChecklistRevision] = useState(0);

  useEffect(() => {
    const fromUrl = sessionFromDemoParams(searchParams);
    if (fromUrl) {
      setSessionState(fromUrl);
      setHydrated(true);
      return;
    }
    if (!hydrated) {
      setSessionState(readCrewAppSession());
      setHydrated(true);
    }
  }, [searchParams, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const store = readCrewInbox(session.crewId);
    setInbox({
      timeOffRequests: store.timeOff,
      notifications: store.notifications,
      unreadCount: unreadNotificationCount(store),
    });
  }, [hydrated, session.crewId]);

  const refreshInbox = useCallback(
    (opts?: { markReadId?: string; markAllRead?: boolean }) => {
      let store = readCrewInbox(session.crewId);
      if (opts?.markAllRead) {
        store = markAllNotificationsRead(session.crewId);
      } else if (opts?.markReadId) {
        store = markNotificationRead(session.crewId, opts.markReadId);
      } else {
        store = readCrewInbox(session.crewId);
      }
      setInbox({
        timeOffRequests: store.timeOff,
        notifications: store.notifications,
        unreadCount: unreadNotificationCount(store),
      });
    },
    [session.crewId],
  );

  const bumpLoadChecklist = useCallback(() => {
    setLoadChecklistRevision((n) => n + 1);
  }, []);

  const setSession = useCallback((next: CrewAppSession) => {
    setSessionState(next);
    writeCrewAppSession(next);
  }, []);

  const allJobs = useMemo(() => mockCrewAppJobs(), []);

  const myJobs = useMemo(() => {
    if (!hydrated) return [];
    return jobsForCrewMember(allJobs, session.crewId, session.jobRole);
  }, [allJobs, session.crewId, session.jobRole, hydrated]);

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
      return jobsForCrewMember([raw], session.crewId, session.jobRole)[0];
    },
    [myJobs, session.crewId, session.jobRole],
  );

  const crewPath = useCallback(
    (pathname: string) => crewAppPath(pathname, searchParams),
    [searchParams],
  );

  const value = useMemo(
    () => ({
      isClientReady: hydrated,
      session,
      setSession,
      myJobs,
      myIssues,
      getJob,
      crewPath,
      inbox,
      refreshInbox,
      loadChecklistRevision,
      bumpLoadChecklist,
    }),
    [
      hydrated,
      session,
      setSession,
      myJobs,
      myIssues,
      getJob,
      crewPath,
      inbox,
      refreshInbox,
      loadChecklistRevision,
      bumpLoadChecklist,
    ],
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
