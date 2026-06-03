import type { ChangeOrder, ChangeOrdersStore } from "./change-orders-types";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function defaultChangeOrdersStore(): ChangeOrdersStore {
  const orders: ChangeOrder[] = [
    {
      id: "co-mv-booked-1",
      moveId: "mv-booked",
      kind: "small_inventory_labor",
      title: "Add 4 wardrobe boxes",
      summary: "Client added wardrobes after walkthrough — same crew and truck.",
      status: "applied",
      amountDelta: 80,
      originalQuoteAmount: 4200,
      revisedQuoteAmount: 4280,
      requiresNewTruckOrDay: false,
      aiGenerated: false,
      createdAt: daysAgoIso(3),
      updatedAt: daysAgoIso(2),
      createdBy: "Alex (Sales)",
    },
    {
      id: "co-mv-complete-1",
      moveId: "mv-complete",
      kind: "charge_order",
      title: "Charge order — piano handling",
      summary: "AI charge order from scope review: specialty piano dolly + 2 hr labor.",
      status: "applied",
      amountDelta: 350,
      originalQuoteAmount: 6800,
      revisedQuoteAmount: 7150,
      requiresNewTruckOrDay: false,
      aiGenerated: true,
      createdAt: daysAgoIso(14),
      updatedAt: daysAgoIso(13),
      createdBy: "AI quote system",
      notes: "Customer signed addendum on site.",
    },
    {
      id: "co-mv-complete-2",
      moveId: "mv-complete",
      kind: "full_requote",
      title: "Full requote — added packing day",
      summary: "Full pack requested after estimate; regenerated quote with Day 0 pack + materials.",
      status: "applied",
      amountDelta: 1200,
      originalQuoteAmount: 5950,
      revisedQuoteAmount: 7150,
      requiresNewTruckOrDay: true,
      aiGenerated: false,
      createdAt: daysAgoIso(21),
      updatedAt: daysAgoIso(20),
      createdBy: "Jordan (Sales)",
    },
  ];

  return { orders };
}
