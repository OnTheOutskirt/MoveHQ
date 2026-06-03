"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  formatMediaCapturedAt,
  type MoveMediaItem,
} from "@/lib/moves/move-media";
import { Camera, Film, ImageIcon } from "lucide-react";

type MoveDetailMediaSidebarProps = {
  open: boolean;
  moveReference: string;
  customerName: string;
  items: MoveMediaItem[];
  onClose: () => void;
};

function MediaTypeIcon({ type }: { type: MoveMediaItem["type"] }) {
  if (type === "video") {
    return <Film className="h-5 w-5 text-sky-600" />;
  }
  return <ImageIcon className="h-5 w-5 text-violet-600" />;
}

export function MoveDetailMediaSidebar({
  open,
  moveReference,
  customerName,
  items,
  onClose,
}: MoveDetailMediaSidebarProps) {
  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Move media"
      description={`${moveReference} · ${customerName}`}
      widthClassName="max-w-lg"
    >
      <div className="space-y-4">
        <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
          Snapshots and video from LiveSwitch will appear here once the integration is
          connected. Thumbnails are omitted in the rail for performance.
        </p>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
            <Camera className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">No media yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Recordings and photos from virtual surveys will show in this list.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <MediaTypeIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-xs capitalize text-slate-500">{item.type}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatMediaCapturedAt(item.capturedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailSidebar>
  );
}
