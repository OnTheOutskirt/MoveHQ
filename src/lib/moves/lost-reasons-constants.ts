/** Whether the opportunity was a real sales pursuit vs a lead to disqualify. */
export type LostQualification = "qualified" | "unqualified";

export type LostReasonOption = {
  id: string;
  label: string;
  description?: string;
};

export const LOST_QUALIFICATION_LABELS: Record<LostQualification, string> = {
  qualified: "Qualified opportunity",
  unqualified: "Unqualified lead",
};

export const LOST_QUALIFICATION_HINTS: Record<LostQualification, string> = {
  qualified:
    "You quoted or pursued a real move that did not book — competitor, price, timing, etc.",
  unqualified:
    "Never became a viable opportunity — bad contact info, spam, out of area, already booked elsewhere, etc.",
};

/** Reasons when the lead was never qualified or should leave the sales pipeline early. */
export const UNQUALIFIED_LOST_REASONS: LostReasonOption[] = [
  {
    id: "no_response",
    label: "Couldn't get ahold",
    description: "No answer, voicemail full, or stopped responding before a real conversation.",
  },
  {
    id: "already_booked",
    label: "Good move but already booked",
    description: "Valid move, but they hired another company before we could quote or close.",
  },
  {
    id: "out_of_service_area",
    label: "Out of service area",
    description: "Origin or destination outside where we operate.",
  },
  {
    id: "duplicate_spam",
    label: "Duplicate / spam",
    description: "Repeat inquiry, test form, or junk lead.",
  },
  {
    id: "wrong_contact",
    label: "Wrong number / wrong person",
    description: "Invalid phone or email, or not looking for a mover.",
  },
  {
    id: "not_a_real_move",
    label: "Not a real move",
    description: "Price shopping only, curiosity, or no intent to book.",
  },
  {
    id: "below_minimum",
    label: "Below minimum job size",
    description: "Too small for our crew minimums or pricing rules.",
  },
  {
    id: "service_not_offered",
    label: "Service we don't offer",
    description: "Commercial-only, freight-only, storage-only, or other out-of-scope work.",
  },
  {
    id: "unqualified_other",
    label: "Other (unqualified)",
    description: "Another disqualifying reason — add a note below.",
  },
];

/** Reasons when you had a real opportunity but lost the sale. */
export const QUALIFIED_LOST_REASONS: LostReasonOption[] = [
  {
    id: "competitor",
    label: "Chose competitor",
    description: "Booked with another mover after receiving our quote or proposal.",
  },
  {
    id: "price_too_high",
    label: "Price too high",
    description: "Our estimate was above their budget or competitor pricing.",
  },
  {
    id: "move_cancelled",
    label: "Move cancelled / not happening",
    description: "Customer is no longer moving (sale fell through, plans changed, etc.).",
  },
  {
    id: "timing",
    label: "Timing didn't work",
    description: "Could not align on dates; may reschedule later but not booking now.",
  },
  {
    id: "diy_rental",
    label: "DIY / rental truck",
    description: "Doing it themselves or using U-Haul / PODs only.",
  },
  {
    id: "scope_changed",
    label: "Scope changed",
    description: "Needs shifted (fewer items, labor-only, etc.) and we were not the fit.",
  },
  {
    id: "deposit_terms",
    label: "Deposit or payment terms",
    description: "Could not agree on deposit, payment method, or contract terms.",
  },
  {
    id: "bad_fit",
    label: "Bad experience / not a fit",
    description: "Reputation concern, difficult customer, or operational red flags.",
  },
  {
    id: "no_decision",
    label: "Ghosted after quote",
    description: "Had a real quote out but customer stopped responding.",
  },
  {
    id: "qualified_other",
    label: "Other (qualified)",
    description: "Another lost-sale reason — add a note below.",
  },
];
