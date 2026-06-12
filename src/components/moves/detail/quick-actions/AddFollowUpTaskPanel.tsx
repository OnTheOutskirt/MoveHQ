"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  FOLLOW_UP_CHANNEL_LABELS,
  MANUAL_FOLLOW_UP_CHANNELS,
  type FollowUpComposerChannel,
} from "@/lib/moves/follow-up-display";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";

const CHANNEL_ICONS = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
} as const;

function defaultDueDateInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function dateInputToDueAt(date: string): string {
  return new Date(`${date}T12:00:00`).toISOString();
}

type AddFollowUpTaskPanelProps = {
  move: MoveRecord;
  onSaved: () => void;
};

export function AddFollowUpTaskPanel({ move, onSaved }: AddFollowUpTaskPanelProps) {
  const { addFollowUpTask } = useMoves();
  const [title, setTitle] = useState(
    () => `Follow up with ${move.customerName.split(" ")[0] || "customer"}`,
  );
  const [dueAt, setDueAt] = useState(defaultDueDateInput);
  const [channel, setChannel] = useState<FollowUpComposerChannel>("call");
  const [notes, setNotes] = useState("");

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed || !dueAt) return;
    addFollowUpTask(move.id, {
      title: trimmed,
      dueAt: dateInputToDueAt(dueAt),
      channel,
      notes: notes.trim() || undefined,
    });
    onSaved();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
      <p className="text-sm text-slate-600">
        Creates a manual follow-up on this move — separate from automated pipeline tasks.
      </p>

      <div className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          How to follow up
        </span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {MANUAL_FOLLOW_UP_CHANNELS.map((option) => {
            const Icon = CHANNEL_ICONS[option];
            const selected = channel === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setChannel(option)}
                className={cn(
                  "inline-flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-medium transition-colors",
                  selected
                    ? "border-brand-300 bg-brand-50 text-brand-800 ring-1 ring-brand-200"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-brand-50/40",
                )}
              >
                <Icon className="h-4 w-4" />
                {FOLLOW_UP_CHANNEL_LABELS[option]}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Task
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Due date
        </span>
        <input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Notes <span className="font-normal normal-case text-slate-400">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What to cover on the follow-up…"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <Button
        type="button"
        className="w-full"
        disabled={!title.trim() || !dueAt}
        onClick={handleSave}
      >
        Add follow-up task
      </Button>
    </div>
  );
}
