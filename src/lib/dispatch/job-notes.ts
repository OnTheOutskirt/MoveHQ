import type { DispatchJob, DispatchJobAssignment } from "./types";

export function jobHasVisibleNote(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): boolean {
  return Boolean(
    assignment.jobNote?.trim() ||
      job.pinnedNote?.trim() ||
      job.dispatchNotes?.trim(),
  );
}

export function jobNotePreview(
  job: DispatchJob,
  assignment: DispatchJobAssignment,
): string {
  return (
    assignment.jobNote?.trim() ||
    job.pinnedNote?.trim() ||
    job.dispatchNotes?.trim() ||
    ""
  );
}
