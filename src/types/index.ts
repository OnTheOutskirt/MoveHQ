import type { JobTypeKey } from "@/lib/tokens/job-type-colors";
import type { PriorityKey } from "@/lib/tokens/priority-colors";
import type { QuoteTypeKey } from "@/lib/tokens/quote-type-colors";
import type { StatusKey } from "@/lib/tokens/status-colors";

export type Customer = {
  id: string;
  name: string;
  type: "residential" | "commercial";
  email?: string;
  phone?: string;
};

export type Contact = {
  id: string;
  name: string;
  customerName: string;
  role?: string;
  email?: string;
  phone?: string;
};

export type Deal = {
  id: string;
  title: string;
  customerName: string;
  contactName: string;
  salesRepName: string;
  status: StatusKey;
  value: number;
  moveDate?: string;
  priority: PriorityKey;
};

export type Quote = {
  id: string;
  reference: string;
  customerName: string;
  contactName: string;
  salesRepName: string;
  quoteType: QuoteTypeKey;
  status: StatusKey;
  total: number;
  createdAt: string;
};

export type Job = {
  id: string;
  reference: string;
  title: string;
  customerName: string;
  contactName: string;
  jobType: JobTypeKey;
  status: StatusKey;
  moveDate: string;
  crewLeadName?: string;
  truckName?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "inactive";
};

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "available" | "on_job" | "off_duty";
};

export type Truck = {
  id: string;
  name: string;
  size: string;
  status: "available" | "in_use" | "maintenance";
};

export type Booking = {
  id: string;
  title: string;
  customerName: string;
  date: string;
  timeSlot: string;
  salesRepName: string;
  status: StatusKey;
};

export type Invoice = {
  id: string;
  reference: string;
  customerName: string;
  jobReference: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
};

export type ActivityItem = {
  id: string;
  description: string;
  customerName: string;
  userName: string;
  timestamp: string;
};
