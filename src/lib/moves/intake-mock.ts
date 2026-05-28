import type { FlatRateIntake, IntakeRoomInventory } from "./flat-rate-intake";
import type { MoveRecord } from "./types";

type MoveCore = Omit<MoveRecord, "jobDays" | "linkedPeople" | "intake" | "followUps" | "followUpDue">;

function defaultAccess(type: string): Record<string, string> {
  if (type === "2-story") {
    return {
      stories: "2 story",
      entrySteps: "No",
      walk: "Under 50 ft",
      hoa: "No",
    };
  }
  if (type === "apartment") {
    return {
      floor: "3",
      elevator: "Standard",
      walk: "50–100 ft",
      coi: "No",
      hoa: "No",
    };
  }
  if (type === "senior") {
    return {
      floor: "2",
      elevator: "Standard",
      walk: "Under 50 ft",
      hoa: "Yes — reserved elevator",
    };
  }
  return {
    entrySteps: "No",
    walk: "Under 50 ft",
    hoa: "No",
  };
}

function defaultRooms(move: MoveCore): IntakeRoomInventory[] {
  const br = move.bedrooms ?? 3;
  const rooms: IntakeRoomInventory[] = [
    { id: "r1", floor: 1, name: "Living Room", items: "Sectional sofa, coffee table, TV stand, 65\" TV" },
    { id: "r2", floor: 1, name: "Kitchen", items: "Dining table, 6 chairs, kitchen fridge" },
  ];
  if (br >= 2) {
    rooms.push(
      { id: "r3", floor: 2, name: "Master Bedroom", items: "King bed, dresser, nightstands" },
      { id: "r4", floor: 2, name: "Bedroom 2", items: "Queen bed, chest of drawers" },
    );
  }
  if (move.originAddress.toLowerCase().includes("garage")) {
    rooms.push({ id: "r5", floor: 1, name: "Garage", items: "Tool boxes, lawn mower, shelving" });
  }
  return rooms;
}

export function buildDefaultIntake(move: MoveCore): FlatRateIntake {
  const originType = move.originAddress.toLowerCase().includes("apt") ? "apartment" : "2-story";
  const destType = move.destinationAddress.toLowerCase().includes("apt")
    ? "apartment"
    : "single-story";

  return {
    clientName: move.customerName,
    clientPhone: move.customerPhone,
    clientEmail: move.customerEmail,
    moveDate: move.preferredDate,
    hearAboutUs: move.source === "Referral" ? "referral-realtor" : "google",
    jobType: "standard",
    origin: {
      street: move.originAddress.split(",")[0] ?? move.originAddress,
      cityStateZip: move.originAddress.split(",").slice(1).join(",").trim(),
      locationType: originType as FlatRateIntake["origin"]["locationType"],
      access: defaultAccess(originType),
    },
    destination: {
      street: move.destinationAddress.split(",")[0] ?? move.destinationAddress,
      cityStateZip: move.destinationAddress.split(",").slice(1).join(",").trim(),
      locationType: destType as FlatRateIntake["destination"]["locationType"],
      access: defaultAccess(destType),
    },
    hasStops: false,
    stops: [],
    homeSizeKey: move.bedrooms === 2 ? "apt-2br" : move.bedrooms === 3 ? "2000" : "1600",
    homeSizeLabel:
      move.bedrooms != null
        ? `${move.bedrooms} BR / ${move.moveType}`
        : "2,000–2,400 sq ft",
    packingDensity: "avg",
    customBoxCount: null,
    estimatedBoxCount: move.bedrooms != null ? move.bedrooms * 25 : 70,
    packingService: "none",
    partialPackRooms: [],
    boxApprovalAcknowledged: false,
    rooms: defaultRooms(move),
    appliances: [
      { id: "a1", label: "Kitchen fridge", quantity: 1 },
      { id: "a2", label: "Washer", quantity: 1 },
      { id: "a3", label: "Dryer", quantity: 1 },
    ],
    applianceDisconnectHandling: "client",
    wardrobe: { jonahCount: 0, jonahType: "rental", clientOwnedCount: 0 },
    hasJunk: false,
    hasSpecialtyItems: false,
    hasHighValueItems: false,
    hasTimingComplexity: false,
    additionalNotes: "",
    liabilityCoverage: "released",
    declaredValue: null,
    liabilityPremium: null,
    manualReviewReasons: [],
    manualReviewRequired: false,
  };
}

const INTAKE_BY_ID: Partial<Record<string, Partial<FlatRateIntake>>> = {
  "mv-new-lead": {
    hearAboutUs: "google",
    jobType: "standard",
    homeSizeKey: "apt-2br",
    homeSizeLabel: "2BR apartment",
    packingDensity: "light",
    estimatedBoxCount: 30,
    packingService: "none",
    origin: {
      street: "12700 Lake Ave",
      cityStateZip: "Lakewood, OH",
      locationType: "apartment",
      access: { floor: "2", elevator: "Standard", walk: "50–100 ft", coi: "No" },
    },
    destination: {
      street: "3400 W 117th St",
      cityStateZip: "Cleveland, OH",
      locationType: "apartment",
      access: { floor: "3", elevator: "Standard", walk: "Under 50 ft", coi: "No" },
    },
    rooms: [
      { id: "r1", floor: 1, name: "Living Room", items: "Couch, TV, small dining table" },
      { id: "r2", floor: 1, name: "Kitchen", items: "Minimal kitchen furniture" },
    ],
    appliances: [{ id: "a1", label: "Kitchen fridge", quantity: 1 }],
    estimatedMoveValue: 1650,
    submittedAt: "2026-05-19T07:42:00Z",
  },
  "mv-waiting-info": {
    hearAboutUs: "referral-other",
    moveDate: "2026-06-21",
    jobType: "office",
    homeSizeKey: "commercial",
    homeSizeLabel: "Commercial — dental office relocation",
    estimatedMoveValue: 8500,
    packingDensity: "avg",
    estimatedBoxCount: 45,
    packingService: "partial",
    partialPackRooms: ["office", "files", "lab"],
    origin: {
      street: "6000 Rockside Rd",
      cityStateZip: "Independence, OH",
      locationType: "commercial",
      access: { floor: "12", elevator: "Freight", dock: "Yes", walk: "100–200 ft", coi: "Yes" },
    },
    destination: {
      street: "8840 Mentor Ave",
      cityStateZip: "Mentor, OH",
      locationType: "commercial",
      access: { floor: "1", elevator: "N/A", walk: "Under 50 ft", coi: "Yes" },
    },
    hasSpecialtyItems: true,
    hasTimingComplexity: true,
    timingNotes: "Sterile equipment — client disconnects imaging units.",
    liabilityCoverage: "full",
    declaredValue: 120000,
    liabilityPremium: 180,
    manualReviewReasons: ["Commercial / specialty equipment"],
    manualReviewRequired: true,
    submittedAt: "2026-05-05T08:15:00Z",
  },
  "mv-waiting-walkthrough": {
    hearAboutUs: "referral-realtor",
    jobType: "standard",
    homeSizeKey: "2400",
    homeSizeLabel: "4BR estate",
    estimatedMoveValue: 4800,
    moveDate: "2026-05-28",
    origin: {
      street: "88 Euclid Ave",
      cityStateZip: "Cleveland, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    destination: {
      street: "2100 Center Rd",
      cityStateZip: "Brunswick, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    submittedAt: "2026-05-10T09:00:00Z",
  },
  "mv-needs-contract": {
    hearAboutUs: "referral-senior",
    jobType: "standard",
    homeSizeKey: "2000",
    homeSizeLabel: "3BR / long-distance",
    packingService: "partial",
    partialPackRooms: ["kitchen", "fragile"],
    moveDate: "2026-06-01",
    origin: {
      street: "4521 Euclid Ave",
      cityStateZip: "Cleveland, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    destination: {
      street: "1200 South Blvd",
      cityStateZip: "Charlotte, NC",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    liabilityCoverage: "released",
    submittedAt: "2026-04-28T09:00:00Z",
  },
  "mv-quote-sent": {
    hearAboutUs: "repeat",
    jobType: "standard",
    homeSizeKey: "2000",
    homeSizeLabel: "3BR / 2,000–2,400 sq ft",
    packingDensity: "avg",
    estimatedBoxCount: 70,
    packingService: "partial",
    partialPackRooms: ["kitchen", "china-cabinet", "decor-some"],
    partialPackOther: "Butler's pantry",
    boxApprovalAcknowledged: true,
    origin: {
      street: "1842 W 25th St",
      cityStateZip: "Cleveland, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    destination: {
      street: "9200 Detroit Ave",
      cityStateZip: "Lakewood, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    rooms: [
      { id: "r1", floor: 1, name: "Living Room", items: "Sectional, 65\" TV, bookshelf" },
      { id: "r2", floor: 1, name: "Kitchen", items: "Dining table, china cabinet contents" },
      { id: "r3", floor: 2, name: "Master Bedroom", items: "King bed, dresser" },
      { id: "r4", floor: 2, name: "Bedroom 2", items: "Queen bed, desk" },
    ],
    appliances: [
      { id: "a1", label: "Kitchen fridge", quantity: 1 },
      { id: "a2", label: "Washer", quantity: 1 },
      { id: "a3", label: "Dryer", quantity: 1 },
    ],
    wardrobe: { jonahCount: 2, jonahType: "rental", clientOwnedCount: 0 },
    liabilityCoverage: "released",
    submittedAt: "2026-05-18T16:45:00Z",
  },
  "mv-ai-booked": {
    hearAboutUs: "google",
    jobType: "standard",
    homeSizeKey: "apt-2br",
    homeSizeLabel: "2BR apartment",
    moveDate: "2026-06-02",
    packingService: "none",
    origin: {
      street: "2200 Superior Ave",
      cityStateZip: "Cleveland, OH",
      locationType: "apartment",
      access: { floor: "4", elevator: "Standard", walk: "Under 50 ft", coi: "No" },
    },
    destination: {
      street: "9900 Detroit Ave",
      cityStateZip: "Lakewood, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    manualReviewReasons: ["AI website booking — verify inventory"],
    manualReviewRequired: true,
    submittedAt: "2026-05-20T06:00:00Z",
  },
  "mv-booked": {
    moveDate: "2026-05-20",
    jobType: "standard",
    homeSizeKey: "2400",
    homeSizeLabel: "4BR / 2,400–2,800 sq ft",
    packingDensity: "avg",
    estimatedBoxCount: 110,
    packingService: "partial",
    partialPackRooms: ["kitchen", "fragile"],
    origin: {
      street: "4501 Chester Ave",
      cityStateZip: "Cleveland, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    destination: {
      street: "11200 Shaker Blvd",
      cityStateZip: "Cleveland, OH",
      locationType: "apartment",
      access: {
        floor: "6",
        elevator: "Standard",
        walk: "100–200 ft",
        coi: "Yes — on file",
      },
    },
    hasTimingComplexity: true,
    timingNotes: "Multi-day: pack → storage → delivery.",
    liabilityCoverage: "released",
    submittedAt: "2026-05-14T09:00:00Z",
  },
  "mv-complete-2day": {
    hearAboutUs: "referral-realtor",
    jobType: "standard",
    homeSizeKey: "3200",
    homeSizeLabel: "4BR / 3,200–3,600 sq ft",
    packingDensity: "heavy",
    estimatedBoxCount: 95,
    packingService: "full",
    boxApprovalAcknowledged: true,
    appliances: [
      { id: "a1", label: "Refrigerator", quantity: 1 },
      { id: "a2", label: "Washer / dryer pair", quantity: 1 },
    ],
    applianceDisconnectHandling: "referral",
    wardrobe: { jonahCount: 4, jonahType: "keep", clientOwnedCount: 2 },
    liabilityCoverage: "full",
    liabilityPremium: 73,
    declaredValue: 48500,
    origin: {
      street: "1840 Coventry Rd",
      cityStateZip: "Cleveland Heights, OH",
      locationType: "2-story",
      access: {
        stories: "2 story",
        entrySteps: "Yes — 6 steps",
        walk: "50–100 ft",
        hoa: "No",
      },
    },
    destination: {
      street: "9200 Detroit Ave",
      cityStateZip: "Lakewood, OH",
      locationType: "apartment",
      access: {
        floor: "4",
        elevator: "Standard",
        walk: "Under 50 ft",
        coi: "Yes — on file",
        hoa: "Yes — reserved elevator",
      },
    },
    submittedAt: "2026-04-28T10:00:00Z",
  },
  "mv-complete": {
    hearAboutUs: "referral-friend",
    jobType: "standard",
    homeSizeKey: "apt-2br",
    homeSizeLabel: "2BR apartment",
    packingDensity: "light",
    estimatedBoxCount: 40,
    packingService: "none",
    origin: {
      street: "1500 E 12th St",
      cityStateZip: "Cleveland, OH",
      locationType: "apartment",
      access: { floor: "2", elevator: "Standard", walk: "Under 50 ft", coi: "No" },
    },
    destination: {
      street: "7800 Detroit Ave",
      cityStateZip: "Lakewood, OH",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    liabilityCoverage: "released",
    submittedAt: "2026-04-20T11:00:00Z",
  },
  "mv-lost": {
    hearAboutUs: "google",
    jobType: "standard",
    homeSizeKey: "2400",
    homeSizeLabel: "3BR / 2,400–2,800 sq ft",
    packingDensity: "avg",
    estimatedBoxCount: 130,
    packingService: "none",
    origin: {
      street: "Cleveland, OH",
      cityStateZip: "",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    destination: {
      street: "Charlotte, NC",
      cityStateZip: "",
      locationType: "2-story",
      access: { stories: "2 story", entrySteps: "No", walk: "Under 50 ft", hoa: "No" },
    },
    additionalNotes: "Lost to national carrier — price-sensitive long-distance.",
    submittedAt: "2026-05-06T10:00:00Z",
  },
};

export function buildIntakeForMove(move: MoveCore): FlatRateIntake {
  const base = buildDefaultIntake(move);
  const patch = INTAKE_BY_ID[move.id];
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    origin: { ...base.origin, ...patch.origin },
    destination: { ...base.destination, ...patch.destination },
    rooms: patch.rooms ?? base.rooms,
    appliances: patch.appliances ?? base.appliances,
    wardrobe: { ...base.wardrobe, ...patch.wardrobe },
    manualReviewReasons: patch.manualReviewReasons ?? base.manualReviewReasons,
    manualReviewRequired:
      patch.manualReviewRequired ?? (patch.manualReviewReasons?.length ?? 0) > 0,
  };
}
