import { defaultFieldCatalog } from "@/lib/settings/field-catalog-defaults";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import { loadSettings } from "@/lib/settings/storage";
import { defaultVendorMessageTemplates } from "./vendor-message-templates-defaults";
import type {
  VendorMessageTemplatesStore,
  VendorTypeMessageTemplates,
} from "./vendor-message-templates-types";
import { VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT } from "./vendor-message-templates-types";

const STORAGE_KEY = "jm-vendor-message-templates-v1";

function vendorTypesFromSettings(): FieldCatalogEntry[] {
  if (typeof window === "undefined") return defaultFieldCatalog().vendorTypes;
  return loadSettings().fieldCatalog.vendorTypes;
}

function normalizeEntry(raw: unknown, vendorTypeId: string): VendorTypeMessageTemplates {
  const defaults = defaultVendorMessageTemplates([{ id: vendorTypeId, label: vendorTypeId }]);
  const fallback = defaults[vendorTypeId] ?? defaultVendorMessageTemplates()[vendorTypeId];
  if (!raw || typeof raw !== "object") return fallback;

  const entry = raw as Partial<VendorTypeMessageTemplates>;
  return {
    vendorTypeId,
    smsBody: typeof entry.smsBody === "string" ? entry.smsBody : fallback.smsBody,
    emailSubject:
      typeof entry.emailSubject === "string" ? entry.emailSubject : fallback.emailSubject,
    emailBody: typeof entry.emailBody === "string" ? entry.emailBody : fallback.emailBody,
  };
}

export function mergeVendorMessageTemplates(
  stored: VendorMessageTemplatesStore | undefined,
  vendorTypes: FieldCatalogEntry[] = vendorTypesFromSettings(),
): VendorMessageTemplatesStore {
  const defaults = defaultVendorMessageTemplates(vendorTypes);
  const merged: VendorMessageTemplatesStore = { ...defaults };

  for (const entry of vendorTypes) {
    const saved = stored?.[entry.id];
    if (saved) {
      merged[entry.id] = normalizeEntry(saved, entry.id);
    }
  }

  return merged;
}

export function loadVendorMessageTemplates(
  vendorTypes?: FieldCatalogEntry[],
): VendorMessageTemplatesStore {
  const types = vendorTypes ?? vendorTypesFromSettings();
  if (typeof window === "undefined") return defaultVendorMessageTemplates(types);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVendorMessageTemplates(types);
    const parsed = JSON.parse(raw) as VendorMessageTemplatesStore;
    return mergeVendorMessageTemplates(parsed, types);
  } catch {
    return defaultVendorMessageTemplates(types);
  }
}

export function saveVendorMessageTemplates(store: VendorMessageTemplatesStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT));
}

export function vendorMessageTemplatesSnapshot(store: VendorMessageTemplatesStore): string {
  return JSON.stringify(store);
}

export function resetVendorTypeTemplates(
  store: VendorMessageTemplatesStore,
  vendorTypeId: string,
  vendorTypes: FieldCatalogEntry[] = vendorTypesFromSettings(),
): VendorMessageTemplatesStore {
  const defaults = defaultVendorMessageTemplates(vendorTypes);
  return {
    ...store,
    [vendorTypeId]: defaults[vendorTypeId] ?? store[vendorTypeId],
  };
}
