import { MOCK_MOVES } from "@/lib/moves/mock-data";

function normalize(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Calendar mock labels → move ids (demo data). */
const LABEL_ALIASES: Record<string, string> = {
  "walsh office": "mv-quote-sent",
  "walsh office relocation": "mv-quote-sent",
  "chen family": "mv-booked",
  "peterson estate": "mv-waiting-walkthrough",
  "peterson estate executor": "mv-waiting-walkthrough",
  "northside dental": "mv-waiting-info",
  "northside dental group": "mv-waiting-info",
  "angela brooks": "mv-complete",
  "james okonkwo": "mv-new-lead",
  "marcus dana ellis": "mv-needs-contract",
  "sarah tom walsh": "mv-quote-sent",
  "rebecca holt": "mv-quote-sent",
  "tyler nguyen": "mv-new-lead",
  "anderson lakewood": "mv-new-lead",
  "rivera condo": "mv-waiting-info",
  "foster duplex": "mv-new-lead",
  "nguyen townhouse": "mv-new-lead",
};

export function resolveMoveIdForCalendarLabel(label: string): string | undefined {
  const key = normalize(label);
  if (LABEL_ALIASES[key]) return LABEL_ALIASES[key];

  for (const move of MOCK_MOVES) {
    const customer = normalize(move.customerName);
    if (customer === key || customer.includes(key) || key.includes(customer)) {
      return move.id;
    }
    const firstToken = key.split(" ")[0];
    if (firstToken && firstToken.length >= 4 && customer.includes(firstToken)) {
      return move.id;
    }
  }

  return undefined;
}

export function calendarMoveDetailHref(label: string, moveId?: string): string | null {
  const id = moveId ?? resolveMoveIdForCalendarLabel(label);
  return id ? `/moves/${id}` : null;
}
