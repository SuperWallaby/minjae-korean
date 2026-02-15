"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

export const DEFAULT_PHONE_COUNTRY = "+82";

export const PHONE_COUNTRY_OPTIONS = [
  { value: "+82", label: "+82 (KR)" },
  { value: "+1", label: "+1 (US)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+81", label: "+81 (JP)" },
  { value: "+61", label: "+61 (AU)" },
  { value: "+49", label: "+49 (DE)" },
  { value: "+7", label: "+7 (RU)" },
] as const;

function digitsOnly(s: string) {
  return (s ?? "").replace(/\D/g, "");
}

export type PhoneParts = { country: string; number: string };

export function parsePhoneParts(full: string): PhoneParts {
  const p = (full ?? "").trim();
  if (!p) return { country: DEFAULT_PHONE_COUNTRY, number: "" };
  const m = p.match(/^\+(\d{1,3})(.*)$/);
  if (m) {
    return { country: `+${m[1]}`, number: digitsOnly(m[2] ?? "") };
  }
  return { country: DEFAULT_PHONE_COUNTRY, number: digitsOnly(p) };
}

export function formatPhoneFull(parts: PhoneParts): string {
  const c = (parts.country ?? DEFAULT_PHONE_COUNTRY).trim() || DEFAULT_PHONE_COUNTRY;
  const n = digitsOnly(parts.number ?? "");
  return n ? `${c}${n}` : "";
}

export type PhonePartsInputProps = {
  country: string;
  number: string;
  onChange: (next: PhoneParts) => void;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
  placeholder?: string;
};

export function PhonePartsInput({
  country,
  number,
  onChange,
  disabled,
  className,
  selectClassName,
  inputClassName,
  placeholder = "Local number",
}: PhonePartsInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        value={(country ?? DEFAULT_PHONE_COUNTRY).trim() || DEFAULT_PHONE_COUNTRY}
        disabled={disabled}
        onChange={(e) => {
          const nextCountry = e.target.value;
          onChange({ country: nextCountry, number: digitsOnly(number) });
        }}
        className={cn(
          "h-11 rounded-md border border-border px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          selectClassName,
        )}
      >
        {PHONE_COUNTRY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Input
        value={digitsOnly(number)}
        disabled={disabled}
        onChange={(e) => {
          const nextNumber = digitsOnly(e.target.value);
          onChange({ country: (country ?? DEFAULT_PHONE_COUNTRY).trim() || DEFAULT_PHONE_COUNTRY, number: nextNumber });
        }}
        placeholder={placeholder}
        className={cn("flex-1", inputClassName)}
        inputMode="tel"
        autoComplete="tel-national"
      />
    </div>
  );
}

