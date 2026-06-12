import type { WalkthroughShareTemplates } from "./walkthrough-share-templates-types";

export const DEFAULT_WALKTHROUGH_SHARE_TEMPLATES: WalkthroughShareTemplates = {
  scheduling: {
    emailSubject: "Schedule your walkthrough",
    emailBody: `Hi {{firstName}},

Pick a time for your walkthrough{{assignee_with}}:

{{link}}

No login required. Reply if you need help.

{{company}}`,
    smsBody: "Hi {{firstName}} — pick a walkthrough time{{assignee_with}}: {{link}}",
  },
  virtual_meeting: {
    emailSubject: "Your virtual walkthrough",
    emailBody: `Hi {{firstName}},

{{slot_sentence}}

Join here:
{{link}}

Reply if you need to reschedule.

{{company}}`,
    smsBody: "Hi {{firstName}} — {{slot_sms}}: {{link}}",
  },
  liveswitch: {
    emailSubject: "Film your items for your estimate",
    emailBody: `Hi {{firstName}},

Use this link to film your items for your move estimate on your own time:

{{link}}

Walk through each room and show what you're moving. Reply if you have questions.

{{company}}`,
    smsBody: "Hi {{firstName}} — film your items for your move estimate: {{link}}",
  },
  confirmation: {
    emailSubject: "Your walkthrough is confirmed",
    emailBody: `Hi {{firstName}},

Your {{mode}} walkthrough{{assignee_with}} is confirmed for {{slot}}.

{{location_line}}

Need to cancel or reschedule? Use this link (no login required):
{{cancelLink}}

Reply to this email or call us if you need help.

{{company}}`,
    smsBody:
      "Hi {{firstName}} — {{mode}} walkthrough{{assignee_with}} confirmed for {{slot}}. Cancel: {{cancelLink}}",
  },
};

export function defaultWalkthroughShareTemplates(): WalkthroughShareTemplates {
  return JSON.parse(JSON.stringify(DEFAULT_WALKTHROUGH_SHARE_TEMPLATES));
}
