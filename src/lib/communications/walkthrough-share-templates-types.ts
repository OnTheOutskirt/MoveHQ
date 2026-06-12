export type WalkthroughShareKind =
  | "scheduling"
  | "virtual_meeting"
  | "liveswitch"
  | "confirmation";

export type WalkthroughShareTemplateSet = {
  emailSubject: string;
  emailBody: string;
  smsBody: string;
};

export type WalkthroughShareTemplates = Record<WalkthroughShareKind, WalkthroughShareTemplateSet>;

export type WalkthroughShareFillContext = {
  firstName: string;
  fullName: string;
  link: string;
  assignee: string;
  assignee_with: string;
  company: string;
  moveDate: string;
  slot: string;
  slot_sentence: string;
  slot_sms: string;
  cancelLink: string;
  mode: string;
  location_line: string;
};

export const WALKTHROUGH_SHARE_KIND_OPTIONS: {
  id: WalkthroughShareKind;
  label: string;
  description: string;
}[] = [
  {
    id: "scheduling",
    label: "Scheduling link",
    description: "Customer picks a walkthrough time from the portal.",
  },
  {
    id: "virtual_meeting",
    label: "Virtual meeting",
    description: "Join link for a booked virtual walkthrough slot.",
  },
  {
    id: "liveswitch",
    label: "LiveSwitch self-film",
    description: "Customer films items on their own — no rep on the link.",
  },
  {
    id: "confirmation",
    label: "Booking confirmation",
    description: "Sent after a walkthrough is booked — includes cancel link.",
  },
];

export const WALKTHROUGH_SHARE_MERGE_FIELDS = [
  { token: "{{firstName}}", label: "Customer first name" },
  { token: "{{fullName}}", label: "Customer full name" },
  { token: "{{link}}", label: "Scheduling or LiveSwitch link URL" },
  { token: "{{assignee}}", label: "Rep name" },
  { token: "{{assignee_with}}", label: '" with Rep" when rep is set, otherwise blank' },
  { token: "{{company}}", label: "Company name" },
  { token: "{{moveDate}}", label: "Preferred move date" },
  { token: "{{slot}}", label: "Booked slot label (virtual meetings)" },
  { token: "{{slot_sentence}}", label: "Virtual intro sentence (email)" },
  { token: "{{slot_sms}}", label: "Virtual phrasing for SMS" },
  { token: "{{cancelLink}}", label: "Customer cancel link (confirmation)" },
  { token: "{{mode}}", label: "Walkthrough type — In person or Virtual" },
  { token: "{{location_line}}", label: "Location or video-call line (confirmation email)" },
] as const;

export const WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT = "jm-walkthrough-share-templates-updated";
