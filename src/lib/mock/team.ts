import type { CrewMember, TeamMember, Truck } from "@/types";

export const mockTeamMembers: TeamMember[] = [
  { id: "tm_1", name: "Jonah M.", role: "Owner / Sales", email: "jonah@jonahsmovers.com", status: "active" },
  { id: "tm_2", name: "Sarah K.", role: "Sales Rep", email: "sarah@jonahsmovers.com", status: "active" },
  { id: "tm_3", name: "Mike T.", role: "Sales Rep", email: "mike@jonahsmovers.com", status: "active" },
  { id: "tm_4", name: "Lisa P.", role: "Office Manager", email: "lisa@jonahsmovers.com", status: "active" },
  { id: "tm_5", name: "Carlos R.", role: "Crew Lead", email: "carlos@jonahsmovers.com", status: "active" },
];

export const mockCrewMembers: CrewMember[] = [
  { id: "crew_1", name: "Carlos R.", role: "Crew Lead", phone: "(555) 301-1001", status: "on_job" },
  { id: "crew_2", name: "Devon L.", role: "Crew Lead", phone: "(555) 301-1002", status: "on_job" },
  { id: "crew_3", name: "Marcus T.", role: "Mover", phone: "(555) 301-1003", status: "on_job" },
  { id: "crew_4", name: "Elena V.", role: "Mover", phone: "(555) 301-1004", status: "available" },
  { id: "crew_5", name: "Jordan K.", role: "Driver", phone: "(555) 301-1005", status: "available" },
];

export const mockTrucks: Truck[] = [
  { id: "truck_1", name: "Truck 06 — 16ft", size: "16ft Box", status: "available" },
  { id: "truck_2", name: "Truck 08 — 20ft", size: "20ft Box", status: "in_use" },
  { id: "truck_3", name: "Truck 12 — 26ft", size: "26ft Box", status: "in_use" },
  { id: "truck_4", name: "Truck 14 — 26ft", size: "26ft Box", status: "available" },
  { id: "truck_5", name: "Truck 03 — 12ft", size: "12ft Box", status: "maintenance" },
];
