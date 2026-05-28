"use client";

import { Button } from "@/components/ui/Button";
import type { InboxChannel } from "@/lib/inbox/types";
import type { MoveRecord } from "@/lib/moves/types";

type InboxComposerProps = {
  channel: InboxChannel;
  move: Pick<MoveRecord, "customerPhone" | "customerEmail" | "reference">;
};

export function InboxComposer({ channel, move }: InboxComposerProps) {
  if (channel === "call") {
    return (
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Call notes
          </span>
          <textarea
            rows={2}
            placeholder="Outcome, voicemail, callback time…"
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <div className="flex gap-2">
          <Button type="button" disabled title="Coming soon" className="flex-1" size="sm">
            Log call
          </Button>
          {move.customerPhone ? (
            <a
              href={`tel:${move.customerPhone}`}
              className="inline-flex h-8 shrink-0 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dial
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (channel === "sms") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          To <span className="font-medium text-slate-800">{move.customerPhone || "—"}</span>
        </p>
        <textarea
          rows={2}
          placeholder="Write a message…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button type="button" disabled title="Coming soon" className="w-full" size="sm">
          Send SMS
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        defaultValue={`Re: ${move.reference}`}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        aria-label="Email subject"
      />
      <textarea
        rows={2}
        placeholder="Write your email…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <Button type="button" disabled title="Coming soon" className="w-full" size="sm">
        Send email
      </Button>
    </div>
  );
}
