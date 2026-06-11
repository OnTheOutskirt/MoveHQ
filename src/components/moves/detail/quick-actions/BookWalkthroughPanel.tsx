"use client";

import { useMovesActions } from "@/components/moves/MovesProvider";
import { WalkthroughLinkShareBar } from "@/components/moves/detail/quick-actions/WalkthroughLinkShareBar";
import type {
  WalkthroughComposeState,
} from "@/components/moves/detail/quick-actions/WalkthroughComposeSidebarChrome";
import type { WalkthroughComposeChannel } from "@/components/moves/detail/quick-actions/WalkthroughMessageCompose";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import {
  availableSlotsForDay,
  buildWalkthroughDayOptions,
} from "@/lib/moves/walkthrough-availability";
import {
  buildLiveSwitchSelfFilmUrl,
  buildVirtualWalkthroughMeetingUrl,
  type WalkthroughShareKind,
} from "@/lib/moves/walkthrough-meeting-links";
import {
  buildWalkthroughSchedulingUrl,
  WALKTHROUGH_LINK_EXPIRY_DAYS,
  type WalkthroughLinkMode,
} from "@/lib/moves/walkthrough-scheduling-link";
import type { WalkthroughScheduleDraft } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import type { MoveRecord } from "@/lib/moves/types";
import { Calendar, Link2, MapPin, PhoneCall, SlidersHorizontal, Video } from "lucide-react";
import { useMemo, useState } from "react";

type BookWalkthroughPanelProps = {
  move: MoveRecord;
  reps: string[];
  onScheduled?: () => void;
  onCompose?: (state: WalkthroughComposeState) => void;
};

type WalkthroughMode = WalkthroughScheduleDraft["mode"];
type BookingTab = "calendar" | "link" | "liveswitch";

export function BookWalkthroughPanel({
  move,
  reps,
  onScheduled,
  onCompose,
}: BookWalkthroughPanelProps) {
  const { scheduleWalkthrough } = useMovesActions();
  const existing = move.scheduledWalkthrough;
  const [tab, setTab] = useState<BookingTab>("calendar");
  const [assignedRep, setAssignedRep] = useState(
    existing?.assignedTo ?? move.assignedRep,
  );
  const [mode, setMode] = useState<WalkthroughMode>(existing?.mode ?? "in_person");
  const [linkMode, setLinkMode] = useState<WalkthroughLinkMode>("customer_choice");
  const [selectedDay, setSelectedDay] = useState<string | null>(
    existing?.scheduledDate ?? null,
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    existing?.startTime ?? null,
  );
  const days = useMemo(() => buildWalkthroughDayOptions(new Date()), []);
  const slots = useMemo(
    () => (selectedDay ? availableSlotsForDay(assignedRep, selectedDay, mode) : []),
    [assignedRep, selectedDay, mode],
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const schedulingLink = useMemo(() => {
    if (!origin) return "";
    return buildWalkthroughSchedulingUrl(origin, {
      moveId: move.id,
      assignee: assignedRep,
      mode: linkMode,
    });
  }, [origin, move.id, assignedRep, linkMode]);

  const liveSwitchLink = useMemo(
    () => (origin ? buildLiveSwitchSelfFilmUrl(origin, move.id) : ""),
    [origin, move.id],
  );

  const virtualMeetingLink = useMemo(() => {
    if (!origin || !selectedDay || !selectedSlot) return "";
    return buildVirtualWalkthroughMeetingUrl(
      origin,
      move.id,
      assignedRep,
      selectedDay,
      selectedSlot,
    );
  }, [origin, move.id, assignedRep, selectedDay, selectedSlot]);

  const virtualSlotLabel =
    selectedDay && selectedSlot
      ? `${formatMoveDate(selectedDay)} at ${selectedSlot}`
      : undefined;

  function handleBook() {
    if (tab !== "calendar" || !selectedDay || !selectedSlot) return;
    const draft: WalkthroughScheduleDraft = {
      scheduledDate: selectedDay,
      startTime: selectedSlot,
      assignedTo: assignedRep,
      mode,
    };
    scheduleWalkthrough(move.id, draft);
    onScheduled?.();
  }

  const canBook = tab === "calendar" && Boolean(selectedDay && selectedSlot);

  function switchTab(next: BookingTab) {
    setTab(next);
  }

  function openCompose(
    channel: WalkthroughComposeChannel,
    kind: WalkthroughShareKind,
    linkUrl: string,
    assigneeForMessage?: string,
    slotLabel?: string,
  ) {
    onCompose?.({ channel, kind, linkUrl, assignee: assigneeForMessage, slotLabel });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-4 pt-3">
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <TabChip active={tab === "calendar"} onClick={() => switchTab("calendar")} icon={Calendar}>
            Calendar
          </TabChip>
          <TabChip active={tab === "link"} onClick={() => switchTab("link")} icon={Link2}>
            Scheduling link
          </TabChip>
          <TabChip active={tab === "liveswitch"} onClick={() => switchTab("liveswitch")} icon={PhoneCall}>
            LiveSwitch
          </TabChip>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "calendar" ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-700">
                {assignedRep}&apos;s availability
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                From {assignedRep}&apos;s availability — Outlook busy times when calendar sync is on
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.key);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-2 text-left text-[11px] transition-colors",
                    selectedDay === day.key
                      ? "border-brand-400 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand-200",
                  )}
                >
                  <span className="block font-semibold">{day.label}</span>
                </button>
              ))}
            </div>

            {selectedDay ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Open slots
                </p>
                {slots.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center text-sm text-slate-500">
                    No open slots — try another day or send a scheduling link.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                          selectedSlot === slot
                            ? "border-brand-500 bg-brand-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center text-sm text-slate-500">
                Select a day to see open times
              </p>
            )}

            {mode === "virtual" && selectedDay && selectedSlot ? (
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
                <p className="text-sm font-medium text-violet-900">Virtual meeting link</p>
                <p className="mt-1 text-xs text-violet-800/80">
                  Send {move.customerName} the join link for this slot — email, text, or copy.
                </p>
                <WalkthroughLinkShareBar
                  className="mt-3"
                  kind="virtual_meeting"
                  move={move}
                  assignee={assignedRep}
                  linkUrl={virtualMeetingLink}
                  linkLabel="Virtual walkthrough join link"
                  showPreview
                  onCompose={(channel) =>
                    openCompose(
                      channel,
                      "virtual_meeting",
                      virtualMeetingLink,
                      assignedRep,
                      virtualSlotLabel,
                    )
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "link" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send {move.customerName} a link to pick a walkthrough time with {assignedRep}. No
              login required.
              {linkMode === "customer_choice"
                ? " They'll choose in-person or virtual on the page."
                : linkMode === "virtual"
                  ? " Link is set to virtual only."
                  : " Link is set to in-person only."}
            </p>
            <WalkthroughLinkShareBar
              kind="scheduling"
              move={move}
              assignee={assignedRep}
              linkUrl={schedulingLink}
              linkLabel="Scheduling link"
              showPreview
              onCompose={(channel) =>
                openCompose(channel, "scheduling", schedulingLink, assignedRep)
              }
            />
            <p className="text-xs text-slate-500">
              Link expires in {WALKTHROUGH_LINK_EXPIRY_DAYS} days · Customer books into{" "}
              {assignedRep}&apos;s calendar (Outlook sync at go-live)
            </p>
          </div>
        ) : null}

        {tab === "liveswitch" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send {move.customerName} a link to film their items on their own time using LiveSwitch
              — no rep visit or scheduling required. They walk through each room on their phone and
              submit video for your estimate.
            </p>
            <WalkthroughLinkShareBar
              kind="liveswitch"
              move={move}
              linkUrl={liveSwitchLink}
              linkLabel="LiveSwitch self-film link"
              showPreview
              onCompose={(channel) =>
                openCompose(channel, "liveswitch", liveSwitchLink)
              }
            />
            <p className="text-xs text-slate-500">
              Demo link — production will create a per-move LiveSwitch room via API.
            </p>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 space-y-3 border-t border-slate-200 bg-white px-4 py-4">
        {tab !== "liveswitch" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Who&apos;s doing the walkthrough</span>
            <select
              value={assignedRep}
              onChange={(e) => {
                setAssignedRep(e.target.value);
                setSelectedSlot(null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {reps.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {tab === "calendar" ? (
          <div>
            <span className="text-xs font-medium text-slate-700">Walkthrough type</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("in_person")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors",
                  mode === "in_person"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                In person
              </button>
              <button
                type="button"
                onClick={() => setMode("virtual")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors",
                  mode === "virtual"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <Video className="h-3.5 w-3.5" />
                Virtual
              </button>
            </div>
          </div>
        ) : null}

        {tab === "link" ? (
          <div>
            <span className="text-xs font-medium text-slate-700">Walkthrough type on link</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLinkMode("in_person")}
                className={cn(
                  "inline-flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 text-[11px] font-medium transition-colors",
                  linkMode === "in_person"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                In person
              </button>
              <button
                type="button"
                onClick={() => setLinkMode("virtual")}
                className={cn(
                  "inline-flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 text-[11px] font-medium transition-colors",
                  linkMode === "virtual"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <Video className="h-3.5 w-3.5" />
                Virtual
              </button>
              <button
                type="button"
                onClick={() => setLinkMode("customer_choice")}
                className={cn(
                  "inline-flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 text-[11px] font-medium leading-tight transition-colors",
                  linkMode === "customer_choice"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Let them decide
              </button>
            </div>
          </div>
        ) : null}

        {tab === "calendar" ? (
          <Button
            type="button"
            disabled={!canBook}
            className="w-full"
            onClick={handleBook}
          >
            {canBook
              ? existing
                ? `Update ${mode === "virtual" ? "virtual" : "in-person"} walkthrough`
                : `Book ${mode === "virtual" ? "virtual" : "in-person"} walkthrough`
              : "Select day and time"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function TabChip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 text-[10px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:text-xs",
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-600 hover:text-slate-900",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </button>
  );
}
