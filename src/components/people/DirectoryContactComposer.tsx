"use client";

import { Button } from "@/components/ui/Button";
import type { DirectoryContactChannel } from "@/lib/people/contact-communication-history";
import { smsHref, telHref } from "@/lib/people/phone-links";

type DirectoryContactComposerProps = {
  action: DirectoryContactChannel;
  name: string;
  phone?: string | null;
  email?: string | null;
};

export function DirectoryContactComposer({
  action,
  name,
  phone,
  email,
}: DirectoryContactComposerProps) {
  switch (action) {
    case "call":
      return (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Call notes
            </span>
            <textarea
              rows={3}
              placeholder="Outcome, voicemail, callback time…"
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled title="Coming soon" className="flex-1">
              Log call
            </Button>
            {phone ? (
              <a
                href={telHref(phone)}
                className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dial
              </a>
            ) : null}
          </div>
        </div>
      );

    case "sms":
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            To <span className="font-medium text-slate-800">{name}</span>
            {phone ? <span className="text-slate-400"> · {phone}</span> : null}
          </p>
          <label className="block text-sm">
            <textarea
              rows={3}
              placeholder="Write a message…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled title="Coming soon" className="flex-1">
              Send SMS
            </Button>
            {phone ? (
              <a
                href={smsHref(phone)}
                className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Open Messages
              </a>
            ) : null}
          </div>
        </div>
      );

    case "email":
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            To <span className="font-medium text-slate-800">{email || "—"}</span>
          </p>
          <label className="block text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </span>
            <input
              type="text"
              defaultValue={`Following up — ${name}`}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block text-sm">
            <textarea
              rows={3}
              placeholder="Write your email…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" disabled title="Coming soon" className="flex-1">
              Send email
            </Button>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Open mail
              </a>
            ) : null}
          </div>
        </div>
      );
  }
}
