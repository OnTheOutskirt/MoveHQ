"use client";

import { Button } from "@/components/ui/Button";
import { linkedPersonRoleConfig, linkedPersonRoleLabel } from "@/lib/moves/linked-people";
import type { MoveLinkedPerson, MoveRecord } from "@/lib/moves/types";
import {
  ROUTES,
  salesDirectoryPersonPath,
} from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import { ExternalLink, Plus, User } from "lucide-react";
import Link from "next/link";

type MoveDetailPeopleTabProps = {
  move: MoveRecord;
};

function PersonRow({ person }: { person: MoveLinkedPerson }) {
  const roleStyle = linkedPersonRoleConfig[person.role];
  const inner = (
    <>
      <div className="flex min-w-0 gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <User className="h-4 w-4 text-slate-500" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{person.name}</p>
          {person.organization ? (
            <p className="text-sm text-slate-500">{person.organization}</p>
          ) : null}
          {person.relationship ? (
            <p className="text-xs text-slate-500">{person.relationship}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {person.phone ? (
              <a href={`tel:${person.phone}`} className="text-brand-600 hover:underline">
                {person.phone}
              </a>
            ) : null}
            {person.email ? (
              <a href={`mailto:${person.email}`} className="text-brand-600 hover:underline">
                {person.email}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", roleStyle.badge)}>
        {linkedPersonRoleLabel(person.role)}
      </span>
    </>
  );

  const rowClass =
    "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0 first:pt-0";

  if (person.personId) {
    return (
      <Link
        href={salesDirectoryPersonPath(person.personId)}
        className={cn(rowClass, "block transition-colors hover:bg-slate-50/80")}
        title="Open in People directory"
      >
        {inner}
      </Link>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}

function PeopleCard({
  title,
  description,
  people,
  emptyMessage,
}: {
  title: string;
  description: string;
  people: MoveLinkedPerson[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <div className="px-4 py-2">
        {people.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          people.map((p) => <PersonRow key={p.id} person={p} />)
        )}
      </div>
    </section>
  );
}

export function MoveDetailPeopleTab({ move }: MoveDetailPeopleTabProps) {
  const customers = move.linkedPeople.filter((p) => p.role === "customer");
  const others = move.linkedPeople.filter((p) => p.role !== "customer");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Primary customer and everyone else tied to this move.
        </p>
        <Button type="button" size="sm" disabled title="Coming soon">
          <Plus className="h-4 w-4" />
          Link person
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PeopleCard
          title="Customer"
          description="Who we bill and communicate with for this move"
          people={customers}
          emptyMessage="No customer contact on file."
        />
        <PeopleCard
          title="Other people"
          description="Care-of, realtors, facilities, referral partners"
          people={others}
          emptyMessage="No related contacts linked yet."
        />
      </div>

      {others.some((p) => p.personId) ? (
        <Link
          href={ROUTES.salesDirectory}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          Open People directory
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
