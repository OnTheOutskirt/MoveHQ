import { syncFollowUpDue } from "./move-follow-ups";
import type {
  FollowUpChannel,
  FollowUpSource,
  FollowUpType,
  MoveFollowUp,
  MoveRecord,
  PipelineStageId,
} from "./types";

type SeedFollowUp = {
  type: FollowUpType;
  title: string;
  dueAt: string;
  channel: FollowUpChannel;
  linkedStage: PipelineStageId;
  status?: MoveFollowUp["status"];
  source?: FollowUpSource;
};

export function seedFollowUps(
  moveId: string,
  assignedTo: string,
  items: SeedFollowUp[],
): MoveFollowUp[] {
  return items.map((item, i) => ({
    id: `fu-${moveId}-${i}`,
    moveId,
    assignedTo,
    status: item.status ?? "open",
    type: item.type,
    title: item.title,
    dueAt: item.dueAt,
    channel: item.channel,
    linkedStage: item.linkedStage,
    source: item.source ?? "automation",
  }));
}

export function attachFollowUps(move: Omit<MoveRecord, "followUps" | "followUpDue"> & { followUpDue?: string | null }, seeds: SeedFollowUp[]): MoveRecord {
  const followUps = seedFollowUps(move.id, move.assignedRep, seeds);
  return syncFollowUpDue({ ...move, followUps, followUpDue: null });
}
