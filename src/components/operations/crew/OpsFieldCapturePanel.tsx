"use client";

import { CaptureForm, MediaList } from "@/components/crew-app/CrewFieldCapturePanel";
import { useFleet } from "@/components/providers/FleetProvider";
import { isSkipper } from "@/lib/operations/crew-records";
import { fleetIdMap } from "@/lib/crew-app/field-capture-crew-map";
import { mockCrewAppJobs } from "@/lib/crew-app/mock-jobs";
import {
  readJobFieldState,
  subscribeJobFieldStore,
  writeJobFieldState,
} from "@/lib/crew-app/job-field-storage";
import { useFieldCaptureActions } from "@/lib/crew-app/use-field-capture";
import type { CrewAppJob } from "@/lib/crew-app/types";
import type { FieldCaptureCategory } from "@/lib/crew-app/field-capture-types";
import { Camera, ImagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const OPS_CAPTURE_CREW_ID = "ops-office";
const OPS_CAPTURE_NAME = "Operations";

type OpsFieldCapturePanelProps = {
  defaultCategory?: FieldCaptureCategory;
};

export function OpsFieldCapturePanel({ defaultCategory }: OpsFieldCapturePanelProps) {
  const { crew } = useFleet();
  const jobs = useMemo(() => mockCrewAppJobs(), []);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === jobId) ?? jobs[0];
  const [formOpen, setFormOpen] = useState(false);
  const { persistAndRoute, retryPendingForJob, isReady } = useFieldCaptureActions();

  const [media, setMedia] = useState(() =>
    job ? readJobFieldState(job.id).jobMedia : [],
  );

  useEffect(() => {
    if (!job) return;
    function sync() {
      setMedia(readJobFieldState(job.id).jobMedia);
    }
    sync();
    return subscribeJobFieldStore(sync);
  }, [job]);

  useEffect(() => {
    if (job && isReady) retryPendingForJob(job);
  }, [job, isReady, retryPendingForJob]);

  const skippers = crew.filter(isSkipper);

  if (!job) return null;

  const jobWithOpsAssignees: CrewAppJob = {
    ...job,
    crew: skippers.length
      ? skippers.map((s) => ({
          role: "skipper" as const,
          name: s.name,
        }))
      : job.crew,
  };

  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Camera className="h-4 w-4 text-violet-700" />
            Field capture — office / depot
          </p>
          <p className="mt-1 max-w-xl text-xs text-slate-600">
            Snap truck returns, depot walk-throughs, or damage documentation. Assign to the
            responsible skipper — photo and violation land on their profile.
          </p>
        </div>
        <label className="text-xs text-slate-600">
          <span className="mb-1 block font-medium">Job context</span>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.moveRef} — {j.customerName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {media.length > 0 ? <MediaList media={media} className="mt-3" /> : null}

      {formOpen ? (
        <CaptureForm
          job={jobWithOpsAssignees}
          sessionName={OPS_CAPTURE_NAME}
          sessionCrewId={OPS_CAPTURE_CREW_ID}
          defaultCategory={defaultCategory ?? "truck_condition"}
          defaultAssigneeId={skippers[0]?.id}
          fleetIdsByName={fleetIdMap(skippers)}
          onCancel={() => setFormOpen(false)}
          onSave={(entry) => {
            const state = readJobFieldState(job.id);
            writeJobFieldState(job.id, {
              ...state,
              jobMedia: [entry, ...state.jobMedia],
            });
            persistAndRoute(job, entry);
            setFormOpen(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-800"
        >
          <ImagePlus className="h-4 w-4" />
          Capture photo
        </button>
      )}
    </section>
  );
}
