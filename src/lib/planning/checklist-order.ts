import type { PlanningGroup } from "./types";

export type ChecklistMonthSection = {
  id: string;
  label: string;
  dateRange: string;
  groupIds: string[];
};

/** V1 checklist order: June → July → August (single-column sections). */
export const V1_CHECKLIST_MONTHS: ChecklistMonthSection[] = [
  {
    id: "june",
    label: "June 2026",
    dateRange: "Jun 1 – Jun 30",
    groupIds: ["ui-desktop", "june-supabase"],
  },
  {
    id: "july",
    label: "July 2026",
    dateRange: "Jul 1 – Jul 31",
    groupIds: [
      "intake",
      "calendar",
      "dashboard",
      "crm",
      "comms",
      "automations",
      "documents",
      "payments",
      "followups",
      "admin",
      "auth",
      "operations",
    ],
  },
  {
    id: "august",
    label: "August 2026",
    dateRange: "Aug 1 – Sep 1 (launch)",
    groupIds: ["ui-pwa", "data-import", "timetrack", "ai", "infra"],
  },
];

export function groupsByMonth(
  allGroups: PlanningGroup[],
  sections: ChecklistMonthSection[],
): { section: ChecklistMonthSection; groups: PlanningGroup[] }[] {
  const byId = Object.fromEntries(allGroups.map((g) => [g.id, g]));
  return sections
    .map((section) => ({
      section,
      groups: section.groupIds.map((id) => byId[id]).filter((g): g is PlanningGroup => g != null),
    }))
    .filter((s) => s.groups.length > 0);
}
