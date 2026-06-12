"use client";



import { MoveCalendarSearchPicker } from "@/components/calendar/MoveCalendarSearchPicker";

import { EmailDraftProvider } from "@/components/communications/EmailDraftProvider";
import { BookWalkthroughPanel } from "@/components/moves/detail/quick-actions/BookWalkthroughPanel";
import {
  useWalkthroughComposeSidebarChrome,
  type WalkthroughComposeState,
} from "@/components/moves/detail/quick-actions/WalkthroughComposeSidebarChrome";
import { WalkthroughAvailabilityPanel } from "@/components/sales/WalkthroughAvailabilityPanel";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSession } from "@/components/providers/SessionProvider";

import { Button } from "@/components/ui/Button";

import { Card, CardContent } from "@/components/ui/Card";

import { DetailSidebar } from "@/components/ui/DetailSidebar";

import { formatMoveDate } from "@/lib/moves/format";

import { salesMovePath } from "@/lib/navigation/routes";

import {

  buildWalkthroughListItems,

  filterWalkthroughsByAssignee,

  formatWalkthroughMode,

  searchMovesForWalkthrough,

  sortWalkthroughListItems,

  walkthroughAssigneesFromMoves,

  type WalkthroughListItem,

} from "@/lib/moves/walkthroughs";

import type { MoveRecord } from "@/lib/moves/types";

import { CalendarOff, CalendarPlus, MapPin, Settings2, Video } from "lucide-react";

import Link from "next/link";

import { useCallback, useMemo, useState } from "react";



type AvailabilityTab = "in_person" | "virtual" | "time_off";

export function WalkthroughsWorkspace() {
  const { user } = useSession();
  const assigneeKey = user.assignedRep || user.name;
  const { moves } = useMoves();

  const [assignee, setAssignee] = useState<string>("all");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [schedulingMoveId, setSchedulingMoveId] = useState<string | null>(null);

  const [pickMoveMode, setPickMoveMode] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityTab, setAvailabilityTab] = useState<AvailabilityTab>("in_person");
  const [walkthroughCompose, setWalkthroughCompose] = useState<WalkthroughComposeState | null>(
    null,
  );



  const assigneeOptions = useMemo(() => walkthroughAssigneesFromMoves(moves), [moves]);



  const reps = useMemo(() => {

    const names = new Set(assigneeOptions);

    for (const move of moves) names.add(move.assignedRep);

    return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  }, [assigneeOptions, moves]);



  const rows = useMemo(() => {
    let items = buildWalkthroughListItems(moves).filter(
      (item) => !item.needsScheduling && item.walkthrough,
    );
    items = filterWalkthroughsByAssignee(items, assignee);
    return sortWalkthroughListItems(items);
  }, [moves, assignee]);



  const schedulingMove = useMemo(() => {

    if (!schedulingMoveId) return null;

    return moves.find((m) => m.id === schedulingMoveId) ?? null;

  }, [moves, schedulingMoveId]);



  const searchWalkthroughMoves = useCallback(

    (pool: typeof moves, query: string) => searchMovesForWalkthrough(pool, query),

    [],

  );



  function openScheduleFromToolbar() {

    setSchedulingMoveId(null);

    setPickMoveMode(true);

    setSidebarOpen(true);

  }



  function openScheduleForMove(moveId: string) {

    setSchedulingMoveId(moveId);

    setPickMoveMode(false);

    setSidebarOpen(true);

  }



  function closeScheduleSidebar() {
    setWalkthroughCompose(null);
    setSidebarOpen(false);
    setSchedulingMoveId(null);
    setPickMoveMode(false);
  }

  const walkthroughComposeChrome = useWalkthroughComposeSidebarChrome(
    schedulingMove,
    walkthroughCompose,
    () => setWalkthroughCompose(null),
  );
  const isWalkthroughComposing = Boolean(walkthroughComposeChrome);



  return (

    <div className="space-y-4">

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center gap-2">

          <label className="flex items-center gap-2 text-sm text-slate-600">

            <span className="font-medium">Assignee</span>

            <select

              value={assignee}

              onChange={(e) => setAssignee(e.target.value)}

              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"

            >

              <option value="all">Everyone</option>

              {assigneeOptions.map((name) => (

                <option key={name} value={name}>

                  {name}

                </option>

              ))}

            </select>

          </label>



          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setAvailabilityTab("in_person");
              setAvailabilityOpen(true);
            }}
          >
            <Settings2 className="h-4 w-4" />
            My availability
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setAvailabilityTab("time_off");
              setAvailabilityOpen(true);
            }}
          >
            <CalendarOff className="h-4 w-4" />
            Time off
          </Button>

          <Button type="button" size="sm" onClick={openScheduleFromToolbar}>
            <CalendarPlus className="h-4 w-4" />
            Schedule walkthrough
          </Button>

        </div>

      </div>



      {rows.length === 0 ? (

        <Card>

          <CardContent className="py-12 text-center text-sm text-slate-500">

            No scheduled walkthroughs
            {assignee !== "all" ? ` for ${assignee}` : ""}. Book one with Schedule walkthrough.

          </CardContent>

        </Card>

      ) : (

        <Card className="overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[52rem] text-left text-sm">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">

                  <th className="px-4 py-3">Customer</th>

                  <th className="px-4 py-3">When</th>

                  <th className="px-4 py-3">Assignee</th>

                  <th className="px-4 py-3">Type</th>

                  <th className="px-4 py-3">Location</th>

                  <th className="px-4 py-3 text-right">Actions</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {rows.map((item) => (

                  <WalkthroughRow

                    key={item.move.id}

                    item={item}

                    onSchedule={() => openScheduleForMove(item.move.id)}

                  />

                ))}

              </tbody>

            </table>

          </div>

        </Card>

      )}



      {sidebarOpen ? (
        <WalkthroughScheduleSidebar
          schedulingMove={schedulingMove}
          pickMoveMode={pickMoveMode}
          schedulingMoveId={schedulingMoveId}
          reps={reps}
          isWalkthroughComposing={isWalkthroughComposing}
          walkthroughComposeChrome={walkthroughComposeChrome}
          searchWalkthroughMoves={searchWalkthroughMoves}
          onSelectMove={(moveId) => setSchedulingMoveId(moveId)}
          onClearMove={() => setSchedulingMoveId(null)}
          onCompose={setWalkthroughCompose}
          onClose={closeScheduleSidebar}
        />
      ) : null}

      {availabilityOpen ? (
        <DetailSidebar
          open
          title="Walkthrough availability"
          description={`${assigneeKey} — in-person, virtual, and time off`}
          onClose={() => setAvailabilityOpen(false)}
          widthClassName="max-w-xl"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
        >
          <WalkthroughAvailabilityPanel
            assigneeKey={assigneeKey}
            initialTab={availabilityTab}
          />
        </DetailSidebar>
      ) : null}

    </div>

  );

}

type WalkthroughComposeChrome = ReturnType<typeof useWalkthroughComposeSidebarChrome>;

function WalkthroughScheduleSidebar({
  schedulingMove,
  pickMoveMode,
  schedulingMoveId,
  reps,
  isWalkthroughComposing,
  walkthroughComposeChrome,
  searchWalkthroughMoves,
  onSelectMove,
  onClearMove,
  onCompose,
  onClose,
}: {
  schedulingMove: MoveRecord | null;
  pickMoveMode: boolean;
  schedulingMoveId: string | null;
  reps: string[];
  isWalkthroughComposing: boolean;
  walkthroughComposeChrome: WalkthroughComposeChrome;
  searchWalkthroughMoves: (pool: MoveRecord[], query: string) => MoveRecord[];
  onSelectMove: (moveId: string) => void;
  onClearMove: () => void;
  onCompose: (state: WalkthroughComposeState) => void;
  onClose: () => void;
}) {
  const sidebar = (
    <DetailSidebar
      open
      title={isWalkthroughComposing ? walkthroughComposeChrome!.title : "Book walkthrough"}
      description={
        isWalkthroughComposing
          ? walkthroughComposeChrome!.description
          : schedulingMove
            ? schedulingMove.customerName
            : "Search for a customer / move"
      }
      onClose={onClose}
      widthClassName="max-w-lg"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
      headerExtra={isWalkthroughComposing ? walkthroughComposeChrome!.headerExtra : undefined}
      footer={isWalkthroughComposing ? walkthroughComposeChrome!.footer : undefined}
    >
      {isWalkthroughComposing ? (
        walkthroughComposeChrome!.body
      ) : (
        <>
          {pickMoveMode ? (
            <div className="shrink-0 border-b border-slate-100 px-4 py-4">
              <label className="block text-xs font-medium text-slate-700">
                Move
                <div className="mt-1.5">
                  <MoveCalendarSearchPicker
                    selectedMoveId={schedulingMoveId ?? undefined}
                    onSelect={(move) => onSelectMove(move.id)}
                    onClear={onClearMove}
                    searchFn={searchWalkthroughMoves}
                    placeholder="Search any active move by name, reference, or address…"
                    emptyQueryHint="Any active customer move — search by name, reference, or address."
                  />
                </div>
              </label>
            </div>
          ) : null}

          {schedulingMove ? (
            <BookWalkthroughPanel
              move={schedulingMove}
              reps={reps}
              onScheduled={onClose}
              onCompose={onCompose}
            />
          ) : pickMoveMode ? (
            <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-slate-500">
              Select a move above to pick a day and time.
            </div>
          ) : null}
        </>
      )}
    </DetailSidebar>
  );

  if (walkthroughComposeChrome?.usesEmailDraft && schedulingMove) {
    return (
      <EmailDraftProvider
        email={schedulingMove.customerEmail}
        defaultSubject={`Your move estimate — ${schedulingMove.reference}`}
      >
        {sidebar}
      </EmailDraftProvider>
    );
  }

  return sidebar;
}

function WalkthroughRow({

  item,

  onSchedule,

}: {

  item: WalkthroughListItem;

  onSchedule: () => void;

}) {

  const { move, walkthrough } = item;
  const location =
    walkthrough?.location ??
    move.intake.origin.cityStateZip ??
    move.originAddress ??
    "TBD";

  if (!walkthrough) return null;

  return (

    <tr className="hover:bg-slate-50/60">

      <td className="px-4 py-3">

        <Link

          href={salesMovePath(move.id)}

          className="font-medium text-slate-900 hover:text-brand-700"

        >

          {move.customerName}

        </Link>

        <p className="text-xs text-slate-500">{move.reference}</p>

      </td>

      <td className="px-4 py-3 text-slate-700">
        <span className="font-medium">{formatMoveDate(walkthrough.scheduledDate)}</span>
        <span className="text-slate-500"> · {walkthrough.startTime}</span>
      </td>

      <td className="px-4 py-3 text-slate-700">{walkthrough.assignedTo}</td>

      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-slate-600">
          {walkthrough.mode === "virtual" ? (
            <Video className="h-3.5 w-3.5" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          {formatWalkthroughMode(walkthrough.mode)}
        </span>
      </td>

      <td className="max-w-[12rem] truncate px-4 py-3 text-slate-600" title={location}>
        {location}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onSchedule}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Reschedule
          </button>
          <Link
            href={salesMovePath(move.id)}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Open
          </Link>
        </div>
      </td>

    </tr>

  );

}


