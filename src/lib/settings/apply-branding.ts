import type { BrandingSettings } from "./types";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function mix(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const t = amount > 0 ? 255 : 0;
  const p = Math.abs(amount);
  return rgbToHex(
    rgb.r + (t - rgb.r) * p,
    rgb.g + (t - rgb.g) * p,
    rgb.b + (t - rgb.b) * p,
  );
}

export function applyBrandingToDocument(branding: BrandingSettings): void {
  const root = document.documentElement;
  const accent = branding.accentColor;

  root.style.setProperty("--brand-500", accent);
  root.style.setProperty("--brand-600", mix(accent, -0.12));
  root.style.setProperty("--brand-700", mix(accent, -0.22));
  root.style.setProperty("--brand-100", mix(accent, 0.85));
  root.style.setProperty("--brand-50", mix(accent, 0.92));
  root.style.setProperty("--sidebar", branding.sidebarColor);
}

export function applyBrandingMeta(branding: BrandingSettings): void {
  document.title = `${branding.productName} — ${branding.companyName}`;

  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = branding.logoDataUrl ?? "/favicon.ico";
}
