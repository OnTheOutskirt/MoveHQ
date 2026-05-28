"use client";

import { MoveStatusBadge } from "@/components/moves/MoveStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatActivityTime,
  formatMoveDate,
  formatQuote,
  moveRouteLabel,
} from "@/lib/moves/format";
import type { MoveActivity, MoveRecord } from "@/lib/moves/types";
import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const activityIcons: Record<MoveActivity["type"], LucideIcon> = {
  note: StickyNote,
  status_change: FileText,
  call: Phone,
  email: Mail,
  document: FileText,
  follow_up: Calendar,
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{children}</p>
    </div>
  );
}

type MoveDetailContentProps = {
  move: MoveRecord;
  compact?: boolean;
};

export function MoveDetailContent({ move, compact = false }: MoveDetailContentProps) {
  const sortedActivities = [...move.activities].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <MoveStatusBadge status={move.status} />
        <Badge variant="brand">{move.source}</Badge>
        <Badge variant="default">{move.moveType}</Badge>
        {move.followUpDue && (
          <Badge variant="warning">Follow-up {formatMoveDate(move.followUpDue)}</Badge>
        )}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" disabled title="Coming soon">
            <Phone className="h-3.5 w-3.5" />
            Log call
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled title="Coming soon">
            <MessageSquare className="h-3.5 w-3.5" />
            SMS
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled title="Coming soon">
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Customer</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Phone">
            <a href={`tel:${move.customerPhone}`} className="text-brand-600 hover:underline">
              {move.customerPhone}
            </a>
          </DetailRow>
          <DetailRow label="Email">
            <a href={`mailto:${move.customerEmail}`} className="text-brand-600 hover:underline">
              {move.customerEmail}
            </a>
          </DetailRow>
          <DetailRow label="Rep">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {move.assignedRep}
            </span>
          </DetailRow>
          {move.bedrooms != null && <DetailRow label="Size">{move.bedrooms} BR</DetailRow>}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Move</h3>
        <div className="mt-2 space-y-2 text-sm text-slate-700">
          <p className="inline-flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {moveRouteLabel(move.originAddress, move.destinationAddress)}
          </p>
          <p>
            <span className="text-slate-500">Date:</span> {formatMoveDate(move.preferredDate)}
          </p>
          <p>
            <span className="text-slate-500">Quote:</span>{" "}
            <span className="font-semibold text-slate-900">
              {formatQuote(move.quoteAmount, move.quoteType)}
            </span>
          </p>
        </div>
      </section>

      {move.status === "booked" && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          Booked — Job Day(s) on the move calendar; assign crew in Dispatch.
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
        {sortedActivities.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {sortedActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <li key={activity.id} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                    <Icon className="h-3 w-3 text-slate-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800">{activity.summary}</p>
                    <p className="text-xs text-slate-500">
                      {formatActivityTime(activity.at)}
                      {activity.actor ? ` · ${activity.actor}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
