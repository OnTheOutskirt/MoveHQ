export type PlanningItem = {
  id: string;
  /** Plain-language task — readable by non-technical stakeholders. */
  label: string;
  /** Extra context for anyone (business meaning). */
  note?: string;
  /** Technical implementation hint for the builder (shown smaller). */
  builderNote?: string;
};

export type PlanningGroup = {
  id: string;
  title: string;
  description?: string;
  /** What this section means in product terms. */
  audienceDescription?: string;
  /** Technical scope for the builder. */
  builderDescription?: string;
  items: PlanningItem[];
};

export type GanttBar = {
  id: string;
  label: string;
  start: string;
  end: string;
  stream: "ui" | "data" | "integrations" | "mobile" | "launch" | "blocked";
  note?: string;
  /** When set, bar dates follow the linked timeline row unless overridden. */
  timelineRowId?: string;
};

export type GanttMilestone = {
  id: string;
  label: string;
  date: string;
  variant: "deadline" | "blocked" | "milestone";
};

export type TimelineRowKind = "default" | "note";

export type TimelineRow = {
  id: string;
  phase: string;
  start: string;
  end: string;
  dates: string;
  deliverables: string;
  itemIds: string[];
  /** Gantt bars that follow this row's start/end when edited in the timeline table. */
  ganttBarIds?: string[];
  rowKind?: TimelineRowKind;
};
