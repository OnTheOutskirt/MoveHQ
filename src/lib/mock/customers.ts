import type { Customer } from "@/types";

export const mockCustomers: Customer[] = [
  { id: "cust_1", name: "Rivera Family", type: "residential", email: "maria.rivera@email.com", phone: "(555) 201-4401" },
  { id: "cust_2", name: "Northline Office Park", type: "commercial", email: "facilities@northline.com", phone: "(555) 201-4402" },
  { id: "cust_3", name: "Chen Household", type: "residential", email: "jchen@email.com", phone: "(555) 201-4403" },
  { id: "cust_4", name: "Brightpath Retail", type: "commercial", email: "ops@brightpath.com", phone: "(555) 201-4404" },
  { id: "cust_5", name: "Walsh & Co.", type: "residential", email: "walsh.home@email.com", phone: "(555) 201-4405" },
];
