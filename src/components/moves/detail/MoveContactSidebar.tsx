"use client";

import { PersonDetailSidebar } from "@/components/people/PersonDetailSidebar";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { getMoveContactPerson } from "@/lib/moves/get-move-contact";
import type { MoveRecord } from "@/lib/moves/types";
import { Mail, Phone } from "lucide-react";

type MoveContactSidebarProps = {
  move: MoveRecord;
  open: boolean;
  onClose: () => void;
};

export function MoveContactSidebar({ move, open, onClose }: MoveContactSidebarProps) {
  const person = getMoveContactPerson(move);

  if (person) {
    return (
      <PersonDetailSidebar
        person={open ? person : null}
        onClose={onClose}
        onDeleted={onClose}
      />
    );
  }

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={move.customerName}
      description="Contact on this move"
    >
      <div className="space-y-4 text-sm">
        {move.customerPhone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            <a href={`tel:${move.customerPhone}`} className="text-brand-600 hover:underline">
              {move.customerPhone}
            </a>
          </p>
        ) : null}
        {move.customerEmail ? (
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <a href={`mailto:${move.customerEmail}`} className="text-brand-600 hover:underline">
              {move.customerEmail}
            </a>
          </p>
        ) : null}
      </div>
    </DetailSidebar>
  );
}
