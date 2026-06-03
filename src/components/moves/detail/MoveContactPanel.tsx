"use client";

import { MOCK_PEOPLE } from "@/lib/people/mock-data";
import { leadChannelLabel } from "@/lib/moves/move-priority-tier";
import type { MoveRecord } from "@/lib/moves/types";
import { salesDirectoryPersonPath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";

type MoveContactPanelProps = {
  move: MoveRecord;
  className?: string;
};

export function MoveContactPanel({ move, className }: MoveContactPanelProps) {
  const person =
    MOCK_PEOPLE.find((p) => p.id === move.contactId) ??
    MOCK_PEOPLE.find((p) => p.moveIds.includes(move.id));

  const name = person?.name ?? move.customerName;
  const phone = person?.phone ?? move.customerPhone;
  const email = person?.email ?? move.customerEmail;
  const pastMoves = person?.moveIds.filter((id) => id !== move.id).length ?? 0;

  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900">Client contact</h3>
      <p className="mt-0.5 text-xs text-slate-500">Linked person record for this move</p>

      <div className="mt-3 space-y-2 text-sm">
        <p className="flex items-center gap-2 font-medium text-slate-900">
          <User className="h-4 w-4 text-slate-400" />
          {name}
        </p>
        {phone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            <a href={`tel:${phone}`} className="text-brand-600 hover:underline">
              {phone}
            </a>
          </p>
        ) : null}
        {email ? (
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <a href={`mailto:${email}`} className="text-brand-600 hover:underline">
              {email}
            </a>
          </p>
        ) : null}
        <p className="text-xs text-slate-600">
          Source: {leadChannelLabel(move.leadChannel)}
        </p>
        {pastMoves > 0 ? (
          <p className="text-xs text-slate-600">{pastMoves} previous move(s) on file</p>
        ) : null}
        {person?.notes ? (
          <p className="rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-600">{person.notes}</p>
        ) : null}
      </div>

      {person ? (
        <Link
          href={salesDirectoryPersonPath(person.id)}
          className="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View full contact history →
        </Link>
      ) : null}
    </section>
  );
}
