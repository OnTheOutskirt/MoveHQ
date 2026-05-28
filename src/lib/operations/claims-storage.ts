import { defaultClaimsStore } from "./claims-defaults";
import { normalizeClaim } from "./claims-normalize";
import type { ClaimsStore, MoveClaim, NewMoveClaim } from "./claims-types";

const STORAGE_KEY = "jm-operations-claims-v1";

let refCounter = 1100;

export function generateClaimId(): string {
  return `clm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateClaimReference(): string {
  refCounter += 1;
  return `CLM-${refCounter}`;
}

export function loadClaimsStore(): ClaimsStore {
  if (typeof window === "undefined") return defaultClaimsStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultClaimsStore();
    const parsed = JSON.parse(raw) as ClaimsStore;
    return {
      claims: (parsed.claims ?? []).map(normalizeClaim),
    };
  } catch {
    return defaultClaimsStore();
  }
}

export function saveClaimsStore(store: ClaimsStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function createClaimFromInput(input: NewMoveClaim): MoveClaim {
  const ts = new Date().toISOString();
  return normalizeClaim({
    ...input,
    id: generateClaimId(),
    reference: generateClaimReference(),
    createdAt: ts,
    updatedAt: ts,
    resolvedAt:
      input.status === "completed" || input.status === "denied" ? ts : undefined,
  });
}
