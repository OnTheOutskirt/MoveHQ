"use client";

import {
  CrewFeedbackDetailSection,
  CrewFeedbackRatingBadge,
} from "@/components/operations/jobs/CrewFeedbackDisplay";
import { normalizeMoveCrewFeedback } from "@/lib/moves/move-feedback-portal";
import type { MoveRecord } from "@/lib/moves/types";

export function MoveCrewFeedbackBadge({ move }: { move: MoveRecord }) {
  const feedback = normalizeMoveCrewFeedback(move.crewFeedback);
  if (!feedback) return null;
  return <CrewFeedbackRatingBadge feedback={feedback} />;
}

/** Customer star rating from post-move email / portal feedback. */
export function MoveCrewFeedbackPanel({ move }: { move: MoveRecord }) {
  const feedback = normalizeMoveCrewFeedback(move.crewFeedback);
  if (!feedback) return null;
  return <CrewFeedbackDetailSection feedback={feedback} />;
}
