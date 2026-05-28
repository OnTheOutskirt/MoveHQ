export type InboxChannel = "call" | "sms" | "email";

export type InboxMessageDirection = "inbound" | "outbound";

export type InboxMessage = {
  id: string;
  channel: InboxChannel;
  direction: InboxMessageDirection;
  body: string;
  at: string;
  actor?: string;
  read: boolean;
};

export type InboxThread = {
  id: string;
  moveId: string;
  customerName: string;
  moveReference: string;
  assignedRep: string;
  customerPhone: string;
  customerEmail: string;
  messages: InboxMessage[];
  unreadCount: number;
  /** Last inbound message has no outbound reply after it */
  needsReply: boolean;
  lastChannel: InboxChannel;
  lastPreview: string;
  lastAt: string;
};

export type InboxFilter =
  | "all"
  | "unread"
  | "needs_reply"
  | "call"
  | "sms"
  | "email";
