import type { Booking } from "@/types";

export const mockBookings: Booking[] = [
  {
    id: "book_1",
    title: "Chen Apartment Move",
    customerName: "Chen Household",
    date: "2026-05-28",
    timeSlot: "8:00 AM",
    salesRepName: "Jonah M.",
    status: "booked",
  },
  {
    id: "book_2",
    title: "Rivera Home Relocation",
    customerName: "Rivera Family",
    date: "2026-06-14",
    timeSlot: "7:30 AM",
    salesRepName: "Jonah M.",
    status: "quoted",
  },
  {
    id: "book_3",
    title: "Northline Suite Walkthrough",
    customerName: "Northline Office Park",
    date: "2026-05-22",
    timeSlot: "2:00 PM",
    salesRepName: "Sarah K.",
    status: "qualified",
  },
  {
    id: "book_4",
    title: "Brightpath Storage Pull",
    customerName: "Brightpath Retail",
    date: "2026-06-03",
    timeSlot: "9:00 AM",
    salesRepName: "Mike T.",
    status: "scheduled",
  },
];
