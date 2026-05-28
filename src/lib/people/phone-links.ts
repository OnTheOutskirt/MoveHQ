/** Normalize phone for tel:/sms: links (keeps leading + if present). */
export function phoneDigits(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function telHref(phone: string): string {
  return `tel:${phoneDigits(phone)}`;
}

export function smsHref(phone: string, body?: string): string {
  const base = `sms:${phoneDigits(phone)}`;
  if (!body?.trim()) return base;
  return `${base}?body=${encodeURIComponent(body.trim())}`;
}
