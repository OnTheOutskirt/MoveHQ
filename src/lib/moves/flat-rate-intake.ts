/**
 * Flat-rate quote intake form — field model aligned with Jonah's Movers job intake (4 stages).
 * Used for move detail display and future CRM/API persistence.
 */

import type { IntakeServiceId } from "@/lib/moves/intake-services";

export const INTAKE_JOB_TYPES = [
  "standard",
  "junk",
  "pack-only",
  "unpack-only",
  "load-unload-only",
  "in-home-rearrange",
  "in-facility",
  "office",
] as const;

export type IntakeJobType = (typeof INTAKE_JOB_TYPES)[number];

export const INTAKE_LOCATION_TYPES = [
  "single-story",
  "2-story",
  "apartment",
  "townhouse",
  "storage",
  "pod",
  "commercial",
  "senior",
  "dump",
  "consignment",
  "furniture-store",
] as const;

export type IntakeLocationType = (typeof INTAKE_LOCATION_TYPES)[number];

export const INTAKE_HEAR_ABOUT = [
  "google",
  "google-maps",
  "yelp",
  "facebook",
  "instagram",
  "nextdoor",
  "referral-friend",
  "referral-realtor",
  "referral-senior",
  "referral-other",
  "repeat",
  "other",
] as const;

export type IntakeHearAbout = (typeof INTAKE_HEAR_ABOUT)[number];

export const PACKING_DENSITY = ["light", "avg", "heavy", "custom"] as const;
export type PackingDensity = (typeof PACKING_DENSITY)[number];

export const PACKING_SERVICE = [
  "none",
  "self-move",
  "full",
  "partial",
] as const;

export type PackingService = (typeof PACKING_SERVICE)[number];

export const LIABILITY_COVERAGE = ["released", "full"] as const;
export type LiabilityCoverage = (typeof LIABILITY_COVERAGE)[number];

export type IntakeAddress = {
  street: string;
  cityStateZip: string;
  locationType: IntakeLocationType | "";
  /** Dynamic access answers from Stage 2 — keyed by question id */
  access: Record<string, string>;
};

export type IntakeStop = {
  id: string;
  label: string;
  street: string;
  cityStateZip: string;
  locationType: IntakeLocationType | "";
  purpose: "pickup" | "dropoff" | "";
  pickupItems?: string;
  dropoffItems?: string;
};

export type IntakeRoomInventory = {
  id: string;
  floor: 1 | 2 | 3;
  name: string;
  items: string;
};

export type IntakeAppliance = {
  id: string;
  label: string;
  quantity: number;
};

export type IntakeWardrobe = {
  jonahCount: number;
  jonahType: "rental" | "keep";
  clientOwnedCount: number;
};

export type IntakeExtraItem = {
  id: string;
  label: string;
  quantity: number;
};

/** TV boxes, safe dolly, and other add-on equipment/supplies. */
export type IntakeMoveExtras = {
  tvBoxCount: number;
  safeDolly: boolean;
  other: IntakeExtraItem[];
};

export type FlatRateIntake = {
  /** Stage 1 — Quick intake */
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  moveDate: string;
  hearAboutUs: IntakeHearAbout | "";
  jobType: IntakeJobType;
  /** Multi-select on Move Scope — source of truth for Services needed checkboxes. */
  servicesNeeded?: IntakeServiceId[];

  /** Load/unload only */
  loadUnloadDirection?: "loading" | "unloading" | "";
  containerType?: string;
  containerParkedAt?: string;

  origin: IntakeAddress;
  destination: IntakeAddress;
  hasStops: boolean;
  stops: IntakeStop[];

  /** Size & packing */
  homeSizeKey: string;
  homeSizeLabel: string;
  packingDensity: PackingDensity | "";
  customBoxCount: number | null;
  estimatedBoxCount: number | null;
  packingService: PackingService;
  partialPackRooms: string[];
  partialPackOther?: string;
  boxApprovalAcknowledged: boolean;

  /** Stage 3 — Inventory */
  rooms: IntakeRoomInventory[];
  appliances: IntakeAppliance[];
  applianceDisconnectHandling?: "client" | "referral" | "";
  wardrobe: IntakeWardrobe;
  extras: IntakeMoveExtras;
  hasJunk: boolean;
  junkVolume?: string;
  junkItems?: string;

  /** Stage 4 — Special */
  hasSpecialtyItems: boolean;
  specialtyNotes?: string;
  hasHighValueItems: boolean;
  hasTimingComplexity: boolean;
  timingNotes?: string;
  additionalNotes?: string;
  liabilityCoverage: LiabilityCoverage | "";
  declaredValue: number | null;
  liabilityPremium: number | null;

  manualReviewReasons: string[];
  manualReviewRequired: boolean;

  /** Agent / quote pipeline (when run) */
  submittedAt?: string;
  /** AI flat-rate estimate before formal quote — used for quadrant scoring. */
  estimatedMoveValue?: number | null;
};

export const INTAKE_JOB_TYPE_LABELS: Record<IntakeJobType, string> = {
  standard: "Standard move",
  junk: "Junk removal",
  "pack-only": "Pack only",
  "unpack-only": "Unpack only",
  "load-unload-only": "Loading / unloading only",
  "in-home-rearrange": "In-home rearrange",
  "in-facility": "In-facility move",
  office: "Office / commercial",
};

export const INTAKE_HEAR_ABOUT_LABELS: Record<IntakeHearAbout, string> = {
  google: "Google search",
  "google-maps": "Google Maps",
  yelp: "Yelp",
  facebook: "Facebook",
  instagram: "Instagram",
  nextdoor: "Nextdoor",
  "referral-friend": "Referral — friend or family",
  "referral-realtor": "Referral — realtor",
  "referral-senior": "Referral — senior living",
  "referral-other": "Referral — other business",
  repeat: "Repeat client",
  other: "Other",
};

export const INTAKE_LOCATION_LABELS: Record<IntakeLocationType, string> = {
  "single-story": "Single story house",
  "2-story": "2-story house",
  apartment: "Apartment / condo",
  townhouse: "Townhouse",
  storage: "Storage unit",
  pod: "POD / portable container",
  commercial: "Commercial / office",
  senior: "Senior living",
  dump: "Dump / disposal",
  consignment: "Consignment / donation",
  "furniture-store": "Furniture store",
};

export const PACKING_SERVICE_LABELS: Record<PackingService, string> = {
  none: "No packing — client packs",
  "self-move": "Client packs & moves own boxes (furniture only)",
  full: "Full pack",
  partial: "Partial pack",
};
