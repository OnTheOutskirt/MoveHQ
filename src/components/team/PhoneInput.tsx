"use client";

import { SettingsInput } from "@/components/settings/SettingsField";
import { formatPhoneDisplay } from "@/lib/format/phone";

type PhoneInputProps = {
  value: string;
  onChange: (formatted: string) => void;
  required?: boolean;
};

export function PhoneInput({ value, onChange, required }: PhoneInputProps) {
  return (
    <SettingsInput
      type="tel"
      inputMode="numeric"
      required={required}
      value={formatPhoneDisplay(value)}
      onChange={(e) => onChange(formatPhoneDisplay(e.target.value))}
      placeholder="(555) 555-0100"
    />
  );
}
