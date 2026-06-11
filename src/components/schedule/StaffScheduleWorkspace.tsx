"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { StaffScheduleEventDetail } from "@/components/schedule/StaffScheduleEventDetail";
import { StaffScheduleNewEventDialog } from "@/components/schedule/StaffScheduleNewEventDialog";
import { StaffScheduleToolbar } from "@/components/schedule/StaffScheduleToolbar";
import { StaffScheduleWeekGrid } from "@/components/schedule/StaffScheduleWeekGrid";
import { addWeeks, formatWeekRange, toDateKey } from "@/lib/calendar/date-utils";
import { useSession } from "@/components/providers/SessionProvider";
import { walkthroughsToStaffEvents } from "@/lib/moves/walkthroughs";
import {
  applyStaffCalendarEdits,
  emptyStaffCalendarEdits,
  type StaffCalendarLocalEdits,
} from "@/lib/schedule/staff-calendar-edits";
import {
  readStaffScheduleViewPrefs,
  writeStaffScheduleViewPrefs,
} from "@/lib/schedule/schedule-view-prefs";
import {
  filterStaffCalendarEvents,
  staffMembersFromEvents,
} from "@/lib/schedule/staff-calendar-filter";
import { expandRecurringEventsForDates, seriesMasterEventId } from "@/lib/schedule/recurrence";
import { openDatesInWeek } from "@/lib/schedule/schedule-time-grid";
import { buildStaffCalendarEvents } from "@/lib/schedule/staff-calendar-mock";
import type {
  StaffCalendarEvent,
  StaffCalendarEventPatch,
  StaffCalendarScope,
  StaffTeamFilter,
} from "@/lib/schedule/types";
import { normalizeOpenDays } from "@/lib/settings/business-calendar";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { DEFAULT_OFFICE_OPEN_DAYS } from "@/lib/workspace/location-profile";
import { useEffect, useMemo, useState } from "react";

export function StaffScheduleWorkspace() {
  const { user } = useSession();
  const { moves } = useMoves();
  const { today, startOfWeek } = useBusinessCalendar();
  const { activeLocation, config } = useWorkspace();
  const location =
    activeLocation ?? config.locations.find((l) => l.isPrimary) ?? config.locations[0];
  const officeOpenDays = useMemo(
    () => normalizeOpenDays(location?.officeOpenDays ?? DEFAULT_OFFICE_OPEN_DAYS),
    [location],
  );

  const baseEvents = useMemo(() => {
    const mock = buildStaffCalendarEvents(user.id, user.name);
    const walkthroughEvents = walkthroughsToStaffEvents(moves);
    return [...mock, ...walkthroughEvents];
  }, [moves, user.id, user.name]);

  const [localEdits, setLocalEdits] = useState<StaffCalendarLocalEdits>(
    emptyStaffCalendarEdits,
  );
  const allEvents = useMemo(
    () => applyStaffCalendarEdits(baseEvents, localEdits),
    [baseEvents, localEdits],
  );

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [scope, setScope] = useState<StaffCalendarScope>("mine");
  const [team, setTeam] = useState<StaffTeamFilter>("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<StaffCalendarEvent | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    const prefs = readStaffScheduleViewPrefs();
    setScope(prefs.scope);
    setTeam(prefs.team);
    setStaffFilter(prefs.staffFilter);
    setWeekStart(startOfWeek(today));
  }, [startOfWeek, today]);

  function persistView(
    nextScope: StaffCalendarScope,
    nextTeam: StaffTeamFilter,
    nextStaffFilter: string,
  ) {
    writeStaffScheduleViewPrefs({
      scope: nextScope,
      team: nextTeam,
      staffFilter: nextStaffFilter,
    });
  }

  const staffMembers = useMemo(
    () => staffMembersFromEvents(allEvents, team),
    [allEvents, team],
  );

  useEffect(() => {
    if (staffFilter === "all") return;
    if (!staffMembers.some((member) => member.staffId === staffFilter)) {
      setStaffFilter("all");
      persistView(scope, team, "all");
    }
  }, [staffFilter, staffMembers, scope, team]);

  function changeScope(next: StaffCalendarScope) {
    setScope(next);
    setSelectedEvent(null);
    persistView(next, team, staffFilter);
  }

  function changeTeam(next: StaffTeamFilter) {
    setTeam(next);
    setStaffFilter("all");
    setSelectedEvent(null);
    persistView(scope, next, "all");
  }

  function changeStaffFilter(next: string) {
    setStaffFilter(next);
    setSelectedEvent(null);
    persistView(scope, team, next);
  }

  const filteredEvents = useMemo(
    () => filterStaffCalendarEvents(allEvents, scope, team, user.id, staffFilter),
    [allEvents, scope, team, user.id, staffFilter],
  );

  const weekEvents = useMemo(() => {
    const openDates = openDatesInWeek(weekStart, officeOpenDays);
    const openKeys = openDates.map(toDateKey);
    return expandRecurringEventsForDates(filteredEvents, openKeys);
  }, [filteredEvents, weekStart, officeOpenDays]);

  const selectedMember = staffMembers.find((member) => member.staffId === staffFilter);

  const scheduleDefaultStaff = useMemo(() => {
    if (selectedMember) return selectedMember;
    if (scope === "mine") {
      return {
        staffId: user.id,
        staffName: user.name,
        department: "sales" as const,
      };
    }
    return (
      staffMembers[0] ?? {
        staffId: user.id,
        staffName: user.name,
        department: "sales" as const,
      }
    );
  }, [selectedMember, scope, staffMembers, user.id, user.name]);

  const defaultScheduleDate = useMemo(() => {
    const open = openDatesInWeek(weekStart, officeOpenDays);
    return open[0] ? toDateKey(open[0]) : toDateKey(weekStart);
  }, [weekStart, officeOpenDays]);

  function patchEvent(eventId: string, patch: StaffCalendarEventPatch) {
    const masterId = seriesMasterEventId(eventId);
    setLocalEdits((prev) => ({
      ...prev,
      patches: { ...prev.patches, [masterId]: { ...prev.patches[masterId], ...patch } },
    }));
    setSelectedEvent((current) =>
      current && seriesMasterEventId(current.id) === masterId
        ? { ...current, ...patch }
        : current,
    );
  }

  function removeEvent(eventId: string) {
    const masterId = seriesMasterEventId(eventId);
    setLocalEdits((prev) => ({
      ...prev,
      removedIds: [...prev.removedIds, masterId],
      added: prev.added.filter((e) => e.id !== masterId),
    }));
    setSelectedEvent(null);
  }

  function addEvent(event: StaffCalendarEvent) {
    setLocalEdits((prev) => ({
      ...prev,
      added: [...prev.added, event],
    }));
    setSelectedEvent(event);
  }

  const viewSummary =
    scope === "mine"
      ? `Showing ${user.name}'s calendar. Drag-to-reschedule and Outlook sync coming with Microsoft Graph.`
      : staffFilter !== "all" && selectedMember
        ? `Showing ${selectedMember.staffName}'s calendar.`
        : team === "all"
          ? "Everyone with software access — sales and operations."
          : team === "sales"
            ? "Sales team schedules."
            : "Operations team schedules only.";

  return (
    <div className="space-y-4">
      <StaffScheduleToolbar
        periodLabel={formatWeekRange(weekStart)}
        scope={scope}
        team={team}
        staffFilter={staffFilter}
        staffMembers={staffMembers}
        onScopeChange={changeScope}
        onTeamChange={changeTeam}
        onStaffFilterChange={changeStaffFilter}
        onSchedule={() => setScheduleOpen(true)}
        onPreviousWeek={() => {
          setWeekStart((w) => addWeeks(w, -1));
          setSelectedEvent(null);
        }}
        onNextWeek={() => {
          setWeekStart((w) => addWeeks(w, 1));
          setSelectedEvent(null);
        }}
        onToday={() => {
          setWeekStart(startOfWeek(today));
          setSelectedEvent(null);
        }}
      />

      <p className="text-xs text-slate-500">{viewSummary}</p>

      <StaffScheduleWeekGrid
        weekStart={weekStart}
        today={today}
        events={weekEvents}
        scope={scope}
        officeOpenDays={officeOpenDays}
        selectedEventId={selectedEvent?.id ?? null}
        onSelectEvent={setSelectedEvent}
      />

      <p className="text-center text-xs text-slate-400">
        {weekEvents.length} event{weekEvents.length === 1 ? "" : "s"} this week
        {scope === "company" && staffFilter !== "all" && selectedMember
          ? ` · ${selectedMember.staffName}`
          : scope === "company" && team !== "all"
            ? ` · ${team === "sales" ? "Sales" : "Ops"}`
            : ""}
      </p>

      <StaffScheduleEventDetail
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSave={patchEvent}
        onRemove={removeEvent}
      />

      <StaffScheduleNewEventDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onCreate={addEvent}
        defaultStaff={scheduleDefaultStaff}
        defaultDateKey={defaultScheduleDate}
      />
    </div>
  );
}
