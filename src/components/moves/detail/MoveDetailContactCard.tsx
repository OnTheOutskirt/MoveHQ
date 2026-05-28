"use client";

import {
  getMoveContactPerson,
  primaryMovePersonRoleLabel,
} from "@/lib/moves/get-move-contact";
import { linkedPersonRoleConfig, primaryCustomer } from "@/lib/moves/linked-people";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Mail, Phone, X } from "lucide-react";

type MoveDetailContactCardProps = {
  move: MoveRecord;
  onOpenContact: () => void;
  onRemove?: () => void;
  className?: string;
};

export function MoveDetailContactCard({
  move,
  onOpenContact,
  onRemove,
  className,
}: MoveDetailContactCardProps) {
  const person = getMoveContactPerson(move);
  const name = person?.name ?? move.customerName;
  const phone = person?.phone ?? move.customerPhone;
  const email = person?.email ?? move.customerEmail;
  const roleLabel = primaryMovePersonRoleLabel(move);
  const linked = primaryCustomer(move.linkedPeople);
  const roleKey = linked?.role ?? "customer";
  const roleStyle = linkedPersonRoleConfig[roleKey];

  return (
    <div
      className={cn(
        "relative mt-2 w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80",
        className,
      )}
    >
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-1.5 top-1.5 z-10 rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-600"
          aria-label="Remove shipper"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onOpenContact}
        className={cn(
          "w-full p-3 text-left transition-colors",
          onRemove && "pr-9",
          "hover:bg-brand-50/50",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{name}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              roleStyle.badge,
            )}
          >
            {roleLabel}
          </span>
        </div>
        {phone ? (
          <p
            className="mt-2 flex items-center gap-2 text-sm text-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <a href={`tel:${phone}`} className="text-brand-600 hover:underline">
              {phone}
            </a>
          </p>
        ) : null}
        {email ? (
          <p
            className="mt-1 flex items-center gap-2 text-sm text-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <a href={`mailto:${email}`} className="truncate text-brand-600 hover:underline">
              {email}
            </a>
          </p>
        ) : null}
      </button>
    </div>
  );
}
