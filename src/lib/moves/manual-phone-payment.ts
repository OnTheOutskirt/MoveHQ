export type ManualPhonePaymentPurpose = "deposit" | "balance" | "other";

export type ManualPhonePaymentInput = {
  amount: number;
  purpose: ManualPhonePaymentPurpose;
  cardholderName: string;
  last4: string;
  note?: string;
};

export function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function cardNumberLast4(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-4);
}

export function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isExpiryValid(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(2000 + year, month, 0, 23, 59, 59);
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function manualPhonePaymentPurposeLabel(purpose: ManualPhonePaymentPurpose): string {
  switch (purpose) {
    case "deposit":
      return "Deposit";
    case "balance":
      return "Balance due";
    default:
      return "Other";
  }
}
