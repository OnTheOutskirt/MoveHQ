import type { Invoice } from "@/types";

export const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    reference: "INV-2026-0312",
    customerName: "Northline Office Park",
    jobReference: "JM-2026-0875",
    amount: 11850,
    status: "paid",
    dueDate: "2026-05-20",
  },
  {
    id: "inv_2",
    reference: "INV-2026-0318",
    customerName: "Chen Household",
    jobReference: "JM-2026-0891",
    amount: 1650,
    status: "sent",
    dueDate: "2026-06-05",
  },
  {
    id: "inv_3",
    reference: "INV-2026-0320",
    customerName: "Rivera Family",
    jobReference: "JM-2026-0887",
    amount: 1425,
    status: "draft",
    dueDate: "2026-05-25",
  },
];
