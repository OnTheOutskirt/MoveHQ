"use client";

import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  enrichMediaWithAnalyzeStatus,
  markMediaAnalyzed,
  partitionMediaByAnalyze,
} from "@/lib/moves/move-media-analyze";
import {
  formatMediaCapturedAt,
  type MoveMediaItem,
} from "@/lib/moves/move-media";
import { Camera, Film, ImageIcon, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

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
  const [revision, setRevision] = useState(0);
  const enriched = useMemo(
    () => enrichMediaWithAnalyzeStatus(items),
    [items, revision],
  );
  const { pending, analyzed } = useMemo(
    () => partitionMediaByAnalyze(enriched),
    [enriched],
  );

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Move media"
      description={`${moveReference} · ${customerName}`}
      widthClassName="max-w-lg"
    >
      <div className="space-y-5">
        <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
          SMS or crew uploads land in <strong>Not yet analyzed</strong>. After AI review they move
          to <strong>AI analyzed</strong> (may trigger requote).
        </p>

        <MediaSection
          title="Not yet analyzed"
          items={pending}
          emptyLabel="No pending media"
          onAnalyze={(id) => {
            markMediaAnalyzed(id);
            setRevision((n) => n + 1);
          }}
        />
        <MediaSection title="AI analyzed" items={analyzed} emptyLabel="None analyzed yet" />
      </div>
    </DetailSidebar>
  );
}

function MediaSection({
  title,
  items,
  emptyLabel,
  onAnalyze,
}: {
  title: string;
  items: ReturnType<typeof enrichMediaWithAnalyzeStatus>;
  emptyLabel: string;
  onAnalyze?: (id: string) => void;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <MediaTypeIcon type={item.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{formatMediaCapturedAt(item.capturedAt)}</p>
                {item.aiSummary ? (
                  <p className="mt-1 text-xs text-violet-800">{item.aiSummary}</p>
                ) : null}
                {onAnalyze ? (
                  <button
                    type="button"
                    onClick={() => onAnalyze(item.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600"
                  >
                    <Sparkles className="h-3 w-3" />
                    Run AI analyze
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
