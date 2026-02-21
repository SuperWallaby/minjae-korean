"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import {
  DEFAULT_PHONE_COUNTRY,
  loadPhoneCountryOptions,
  type PhoneCountryOption,
} from "@/lib/phoneCountryOptions";

export { DEFAULT_PHONE_COUNTRY };

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
  const [options, setOptions] = React.useState<PhoneCountryOption[]>(() => [
    { value: DEFAULT_PHONE_COUNTRY, label: `${DEFAULT_PHONE_COUNTRY} (KR)` },
  ]);
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadPhoneCountryOptions().then((list) => {
      if (!cancelled) {
        setOptions(list);
        setOptionsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentCountry = (country ?? DEFAULT_PHONE_COUNTRY).trim() || DEFAULT_PHONE_COUNTRY;
  const currentOption = options.find((o) => o.value === currentCountry) ?? {
    value: currentCountry,
    label: `${currentCountry}`,
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        value={currentCountry}
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
        {!optionsLoaded ? (
          <option value={currentOption.value}>{currentOption.label}</option>
        ) : (
          options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        )}
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

