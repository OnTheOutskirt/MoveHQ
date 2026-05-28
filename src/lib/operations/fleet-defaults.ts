import { toDateKey } from "@/lib/calendar/date-utils";
import type { FleetStore } from "./fleet-types";
import { DEFAULT_WORK_DAYS } from "./fleet-types";

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
}

export const defaultFleetStore = (): FleetStore => {
  const crew: FleetStore["crew"] = [
    { id: "crew-marcus", name: "Marcus T.", roles: ["skipper", "mover"], active: true, teamMemberId: "tm_6" },
    { id: "crew-tyler", name: "Tyler Brooks", roles: ["skipper", "driver", "mover"], active: true },
    { id: "crew-devon", name: "Devon Lee", roles: ["driver", "mover"], active: true, teamMemberId: "tm_5" },
    { id: "crew-sam", name: "Sam R.", roles: ["driver", "mover"], active: true },
    { id: "crew-chris", name: "Chris P.", roles: ["mover"], active: true },
    { id: "crew-jordan", name: "Jordan Kim", roles: ["mover"], active: true, teamMemberId: "tm_7" },
    { id: "crew-alex", name: "Alex Nguyen", roles: ["mover"], active: true },
    { id: "crew-riley", name: "Riley Ortiz", roles: ["driver", "mover"], active: true },
    { id: "crew-dana", name: "Dana Ellis", roles: ["mover"], active: true },
    { id: "crew-james", name: "James K.", roles: ["skipper", "mover"], active: true },
    { id: "crew-pat", name: "Pat Morrison", roles: ["driver", "mover"], active: true },
    { id: "crew-casey", name: "Casey Wu", roles: ["mover"], active: true },
  ];

  const trucks: FleetStore["trucks"] = [
    {
      id: "truck-1",
      label: "Truck 1",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 3,
      hasLiftgate: true,
    },
    {
      id: "truck-2",
      label: "Truck 2",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 3,
      hasLiftgate: true,
    },
    {
      id: "truck-3",
      label: "Truck 3",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 3,
      hasLiftgate: false,
    },
    {
      id: "truck-4",
      label: "Truck 4",
      type: "24ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "24",
      cabSize: 3,
      hasLiftgate: true,
    },
    {
      id: "truck-5",
      label: "Truck 5",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 3,
      hasLiftgate: true,
    },
    {
      id: "truck-6",
      label: "Truck 6",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 2,
      hasLiftgate: false,
    },
    {
      id: "truck-7",
      label: "Truck 7",
      type: "26ft Box truck",
      active: true,
      vehicleType: "box_truck",
      lengthFt: "26",
      cabSize: 3,
      hasLiftgate: true,
    },
    {
      id: "truck-8",
      label: "Enterprise truck 8",
      type: "26ft Rental truck",
      active: true,
      vehicleType: "rental_truck",
      lengthFt: "26",
      cabSize: 2,
      hasLiftgate: true,
    },
    {
      id: "truck-9",
      label: "Enterprise truck 9",
      type: "26ft Rental truck",
      active: true,
      vehicleType: "rental_truck",
      lengthFt: "26",
      cabSize: 2,
      hasLiftgate: true,
    },
  ];

  const temporaryRentals: FleetStore["temporaryRentals"] = [
    {
      id: "rental-uhaul-1",
      label: "U-Haul 26ft",
      vendor: "U-Haul",
      vehicleType: "rental_truck",
      lengthFt: "26",
      cabSize: 2,
      hasLiftgate: false,
      startDate: daysFromToday(2),
      endDate: daysFromToday(4),
      notes: "Weekend overflow — return Sunday PM",
    },
  ];

  const schedules = crew.map((c) => ({
    crewId: c.id,
    workDays: [...DEFAULT_WORK_DAYS],
  }));

  const timeOffRequests = [
    {
      id: "off-1",
      crewId: "crew-jordan",
      startDate: daysFromToday(8),
      endDate: daysFromToday(9),
      reason: "Family event",
      status: "pending" as const,
      source: "crew_app" as const,
      submittedAt: new Date().toISOString(),
    },
    {
      id: "off-2",
      crewId: "crew-chris",
      startDate: daysFromToday(3),
      endDate: daysFromToday(3),
      reason: "Doctor appointment",
      status: "approved" as const,
      source: "manual" as const,
      submittedAt: daysFromToday(-2),
      reviewedAt: daysFromToday(-1),
      reviewNote: "Approved — coverage OK",
    },
  ];

  const truckOutages = [
    {
      id: "out-1",
      truckId: "truck-3",
      startDate: daysFromToday(5),
      endDate: daysFromToday(12),
      reason: "Body shop — side panel repair",
    },
  ];

  const maintenance = [
    {
      id: "mnt-1",
      truckId: "truck-1",
      title: "Oil change & inspection",
      type: "Preventive",
      scheduledDate: daysFromToday(14),
      status: "scheduled" as const,
      mileage: 84200,
      vendor: "Fleet Service Co.",
    },
    {
      id: "mnt-2",
      truckId: "truck-2",
      title: "Brake service",
      type: "Repair",
      scheduledDate: daysFromToday(-5),
      status: "overdue" as const,
      mileage: 91050,
      vendor: "JM Fleet Garage",
      notes: "Squeal reported on last route",
    },
    {
      id: "mnt-3",
      truckId: "truck-5",
      title: "Annual DOT inspection",
      type: "Compliance",
      scheduledDate: daysFromToday(30),
      status: "scheduled" as const,
      mileage: 76500,
    },
    {
      id: "mnt-4",
      truckId: "truck-8",
      title: "Tire rotation",
      type: "Preventive",
      scheduledDate: daysFromToday(-20),
      status: "completed" as const,
      mileage: 120400,
      vendor: "Enterprise partner shop",
    },
  ];

  return { crew, trucks, temporaryRentals, schedules, timeOffRequests, truckOutages, maintenance };
};
