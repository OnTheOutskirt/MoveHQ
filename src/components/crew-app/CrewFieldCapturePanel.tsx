"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { jobCrewAssignees } from "@/lib/crew-app/field-capture-crew-map";
import {
  categoryRequiresAssignee,
  defaultViolationForCategory,
} from "@/lib/crew-app/field-capture-routing";
import {
  FIELD_CAPTURE_CATEGORIES,
  FIELD_CAPTURE_CATEGORY_LABELS,
  TRUCK_CONDITION_VIOLATION_IDS,
  generateFieldMediaId,
  type FieldCaptureCategory,
  type JobFieldMediaEntry,
} from "@/lib/crew-app/field-capture-types";
import {
  placeholderFieldImageDataUrl,
  readImageFileAsDataUrl,
} from "@/lib/crew-app/field-media-image";
import {
  readJobFieldState,
  subscribeJobFieldStore,
  writeJobFieldState,
} from "@/lib/crew-app/job-field-storage";
import { canCaptureFieldMedia } from "@/lib/crew-app/role-access";
import { useFieldCaptureActions } from "@/lib/crew-app/use-field-capture";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { SKIPPER_VIOLATION_LABELS } from "@/lib/operations/skipper-violations";
import type { SkipperViolationId } from "@/lib/operations/skipper-violations";
import { cn } from "@/lib/utils";
import { Camera, CheckCircle2, CloudOff, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type CrewFieldCapturePanelProps = {
  job: CrewAppJob;
  /** Pre-select category (e.g. sign-off damage flow) */
  defaultCategory?: FieldCaptureCategory;
  /** Compact list + single capture CTA */
  variant?: "full" | "compact";
  title?: string;
  subtitle?: string;
};

export function CrewFieldCapturePanel({
  job,
  defaultCategory,
  variant = "full",
  title = "Field capture",
  subtitle = "Snap a photo, categorize it, and assign accountability — syncs to move record, claims, and crew profiles.",
}: CrewFieldCapturePanelProps) {
  const { session } = useCrewApp();
  const { persistAndRoute, retryPendingForJob, defaultAssigneeId, isReady } =
    useFieldCaptureActions();
  const [media, setMedia] = useState(() => readJobFieldState(job.id).jobMedia);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    function sync() {
      setMedia(readJobFieldState(job.id).jobMedia);
    }
    sync();
    return subscribeJobFieldStore(sync);
  }, [job.id]);

  useEffect(() => {
    if (isReady) retryPendingForJob(job);
  }, [isReady, job, retryPendingForJob]);

  const canCapture = canCaptureFieldMedia(session.jobRole);

  if (!canCapture) {
    return variant === "full" ? (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          Field capture is available to skippers and drivers on this job.
        </p>
        {media.length > 0 ? <MediaList media={media} className="mt-3" /> : null}
      </section>
    ) : null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Camera className="h-4 w-4 text-brand-600" />
        {title}
      </p>
      {variant === "full" ? (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      ) : null}

      {media.length > 0 ? <MediaList media={media} className="mt-3" /> : (
        <p className="mt-2 text-xs text-slate-500">No photos yet.</p>
      )}

      {formOpen ? (
        <CaptureForm
          job={job}
          sessionName={session.name}
          sessionCrewId={session.crewId}
          defaultCategory={defaultCategory}
          defaultAssigneeId={defaultAssigneeId(job)}
          onCancel={() => setFormOpen(false)}
          onSave={(entry) => {
            persistAndRoute(job, entry);
            setFormOpen(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand-300 py-2.5 text-sm font-medium text-brand-800 hover:bg-brand-50/50"
        >
          <ImagePlus className="h-4 w-4" />
          Capture photo
        </button>
      )}
    </section>
  );
}

type CaptureFormProps = {
  job: CrewAppJob;
  sessionName: string;
  sessionCrewId: string;
  defaultCategory?: FieldCaptureCategory;
  defaultAssigneeId?: string;
  /** Fleet roster ids keyed by name — used by ops / office capture */
  fleetIdsByName?: Record<string, string>;
  onCancel: () => void;
  onSave: (entry: JobFieldMediaEntry) => void;
};

function CaptureForm({
  job,
  sessionName,
  sessionCrewId,
  defaultCategory,
  defaultAssigneeId,
  fleetIdsByName,
  onCancel,
  onSave,
}: CaptureFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<FieldCaptureCategory>(
    defaultCategory ?? "general",
  );
  const assignees = useMemo(() => {
    const all = jobCrewAssignees(job, fleetIdsByName);
    if (category === "truck_condition") {
      const skippers = all.filter((a) => a.role === "skipper");
      return skippers.length > 0 ? skippers : all;
    }
    return all;
  }, [job, fleetIdsByName, category]);
  const [violationId, setViolationId] = useState<SkipperViolationId | "">(
    defaultViolationForCategory(defaultCategory ?? "general") ?? "",
  );
  const [assignedCrewId, setAssignedCrewId] = useState(
    defaultAssigneeId ?? assignees[0]?.crewId ?? "",
  );
  const [note, setNote] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const assignee = assignees.find((a) => a.crewId === assignedCrewId);
  const truckLabel = job.trucks[0];

  function onCategoryChange(next: FieldCaptureCategory) {
    setCategory(next);
    if (next === "truck_condition") {
      setViolationId(defaultViolationForCategory(next) ?? "dirty_truck");
    } else {
      setViolationId("");
    }
  }

  async function onFileChange(file: File | null) {
    if (!file) return;
    setLoadingImage(true);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch {
      setImageDataUrl(
        placeholderFieldImageDataUrl(FIELD_CAPTURE_CATEGORY_LABELS[category]),
      );
    } finally {
      setLoadingImage(false);
    }
  }

  function handleSubmit() {
    setSubmitting(true);
    const preview =
      imageDataUrl ??
      placeholderFieldImageDataUrl(FIELD_CAPTURE_CATEGORY_LABELS[category]);
    const entry: JobFieldMediaEntry = {
      id: generateFieldMediaId(),
      category,
      capturedAt: new Date().toISOString(),
      capturedByCrewId: sessionCrewId,
      capturedByName: sessionName,
      moveRef: job.moveRef,
      moveId: job.moveId ?? job.id,
      assignedCrewId: categoryRequiresAssignee(category) ? assignedCrewId : undefined,
      assignedCrewName: categoryRequiresAssignee(category) ? assignee?.name : undefined,
      violationId:
        category === "truck_condition" && violationId
          ? (violationId as SkipperViolationId)
          : undefined,
      truckLabel,
      note: note.trim() || undefined,
      imageDataUrl: preview,
      syncStatus: "pending",
    };
    onSave(entry);
    setSubmitting(false);
  }

  const needsAssignee = categoryRequiresAssignee(category);
  const needsViolation = category === "truck_condition";
  const canSubmit =
    !loadingImage &&
    (!needsAssignee || Boolean(assignedCrewId)) &&
    (!needsViolation || Boolean(violationId));

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-brand-100 bg-brand-50/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800">New capture</p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white"
        >
          {loadingImage ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          ) : imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="Capture preview" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center">
              <Camera className="mx-auto h-6 w-6 text-brand-600" />
              <p className="mt-1 text-[10px] font-medium text-slate-600">Camera</p>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Category
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {FIELD_CAPTURE_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                active={category === cat}
                onClick={() => onCategoryChange(cat)}
              >
                {FIELD_CAPTURE_CATEGORY_LABELS[cat]}
              </CategoryChip>
            ))}
          </div>
        </div>
      </div>

      {category === "truck_condition" ? (
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Issue type
          </label>
          <select
            value={violationId}
            onChange={(e) => setViolationId(e.target.value as SkipperViolationId)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
          >
            {TRUCK_CONDITION_VIOLATION_IDS.map((id) => (
              <option key={id} value={id}>
                {SKIPPER_VIOLATION_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {needsAssignee ? (
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Assign to crew member
          </label>
          <select
            value={assignedCrewId}
            onChange={(e) => setAssignedCrewId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
          >
            {assignees.map((a) => (
              <option key={a.crewId} value={a.crewId}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            Logged on their skipper profile with photo evidence.
          </p>
        </div>
      ) : null}

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="What happened, where on truck/home, etc."
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold",
            canSubmit
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-slate-100 text-slate-400",
          )}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save &amp; route
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
        active ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200",
      )}
    >
      {children}
    </button>
  );
}

function MediaList({ media, className }: { media: JobFieldMediaEntry[]; className?: string }) {
  return (
    <ul className={cn("space-y-2", className)}>
      {media.map((m) => (
        <li
          key={m.id}
          className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2"
        >
          <MediaThumb entry={m} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-900">
              {FIELD_CAPTURE_CATEGORY_LABELS[m.category]}
            </p>
            {m.violationId ? (
              <p className="text-[10px] text-red-700">
                {SKIPPER_VIOLATION_LABELS[m.violationId]}
                {m.assignedCrewName ? ` → ${m.assignedCrewName}` : ""}
              </p>
            ) : m.assignedCrewName ? (
              <p className="text-[10px] text-slate-600">→ {m.assignedCrewName}</p>
            ) : null}
            {m.note ? (
              <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">{m.note}</p>
            ) : null}
            <p className="mt-0.5 text-[10px] text-slate-400">
              {new Date(m.capturedAt).toLocaleString()}
            </p>
          </div>
          <SyncBadge status={m.syncStatus} />
        </li>
      ))}
    </ul>
  );
}

function MediaThumb({ entry }: { entry: JobFieldMediaEntry }) {
  if (entry.imageDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={entry.imageDataUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-500">
      <Camera className="h-5 w-5" />
    </div>
  );
}

function SyncBadge({ status }: { status: JobFieldMediaEntry["syncStatus"] }) {
  if (status === "synced") {
    return <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-label="Synced" />;
  }
  if (status === "pending") {
    return <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-amber-500" aria-label="Syncing" />;
  }
  return <CloudOff className="mt-1 h-4 w-4 shrink-0 text-red-500" aria-label="Sync failed" />;
}

export { MediaList, MediaThumb, CaptureForm };
