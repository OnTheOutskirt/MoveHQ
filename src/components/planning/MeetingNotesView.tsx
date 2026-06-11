"use client";

import { ChecklistGroup } from "@/components/planning/ChecklistGroup";
import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DEFAULT_MEETING_SESSION_ID,
  getMeetingSession,
  isMeetingSessionId,
  MEETING_NOTE_SESSIONS,
  meetingNotesItemIdsForSession,
  meetingSessionProgressPct,
} from "@/lib/planning/meeting-notes";
import { countProgress } from "@/lib/planning/planning-progress";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function MeetingNotesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress } = usePlanningProgress();

  const rawMeeting = searchParams.get("meeting");
  const activeSessionId = isMeetingSessionId(rawMeeting ?? "")
    ? rawMeeting!
    : DEFAULT_MEETING_SESSION_ID;

  const session = useMemo(
    () => getMeetingSession(activeSessionId) ?? MEETING_NOTE_SESSIONS[0]!,
    [activeSessionId],
  );

  const sessionStats = useMemo(() => {
    const ids = meetingNotesItemIdsForSession(session.id);
    const { done, total } = countProgress(ids, progress);
    const pct = meetingSessionProgressPct(session.id, progress);
    return { done, total, pct };
  }, [session.id, progress]);

  const setActiveSession = useCallback(
    (sessionId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "todo");
      params.set("meeting", sessionId);
      router.push(`/planning?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const headerTitle =
    session.id === "ui-todo" ? "JM Move HQ user interface to-do" : `Meeting · ${session.dateLabel}`;

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-slate-50/60">
        <CardContent className="flex items-start gap-3 py-5">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Todo</p>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              UI backlog and meeting action items. Pick a list below, then check items off as they
              are scoped, built, or decided — progress saves in this browser.
            </p>
          </div>
        </CardContent>
      </Card>

      <nav
        className="flex flex-wrap gap-1 border-b border-slate-200"
        aria-label="Todo lists"
      >
        {MEETING_NOTE_SESSIONS.map((m) => {
          const active = m.id === session.id;
          const pct = meetingSessionProgressPct(m.id, progress);
          const ids = meetingNotesItemIdsForSession(m.id);
          const { done, total } = countProgress(ids, progress);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveSession(m.id)}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span>{m.tabLabel}</span>
              <span
                className={cn(
                  "ml-2 text-xs font-semibold tabular-nums",
                  active ? "text-brand-600/90" : "text-slate-400",
                )}
              >
                {pct}%
              </span>
              <span className="sr-only">
                {" "}
                — {done} of {total} done
              </span>
            </button>
          );
        })}
      </nav>

      <Card className="border-slate-200">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{headerTitle}</p>
            {session.summary ? (
              <p className="mt-1 max-w-3xl text-sm text-slate-600">{session.summary}</p>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-brand-700">{sessionStats.pct}%</p>
            <p className="text-xs font-medium text-slate-500">
              {sessionStats.done} of {sessionStats.total} done
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {session.groups.map((group) => (
          <ChecklistGroup key={`${session.id}-${group.id}`} group={group} />
        ))}
      </div>
    </div>
  );
}
