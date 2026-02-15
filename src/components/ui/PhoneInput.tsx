"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

const DEFAULT_COUNTRY = "+82";

const COUNTRY_OPTIONS = [
  { value: "+82", label: "+82 (KR)" },
  { value: "+1", label: "+1 (US)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+81", label: "+81 (JP)" },
  { value: "+61", label: "+61 (AU)" },
  { value: "+49", label: "+49 (DE)" },
  { value: "+7", label: "+7 (RU)" },
] as const;

function splitPhone(full: string): { country: string; local: string } {
  const p = (full ?? "").trim();
  if (!p) return { country: DEFAULT_COUNTRY, local: "" };
  const m = p.match(/^\+(\d{1,3})(.*)$/);
  if (m) {
    const country = "+" + m[1];
    const localRaw = (m[2] ?? "").trim();
    const localDigits = localRaw.replace(/\D/g, "");
    return { country, local: localDigits };
  }
  // If user pasted without country code, treat as local.
  return { country: DEFAULT_COUNTRY, local: p.replace(/\D/g, "") };
}

function combinePhone(country: string, local: string) {
  const c = (country || DEFAULT_COUNTRY).trim();
  const l = (local || "").replace(/\D/g, "");
  return l ? `${c}${l}` : c;
}

export type PhoneInputProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
  placeholder?: string;
};

export function PhoneInput({
  value,
  onChange,
  disabled,
  className,
  selectClassName,
  inputClassName,
  placeholder = "Local number",
}: PhoneInputProps) {
  const [{ country, local }, setParts] = React.useState(() =>
    splitPhone(value),
  );

  React.useEffect(() => {
    const parsed = splitPhone(value);
    // Only sync when external value differs from current internal parts to avoid
    // overwriting in-progress user input (prevents first-key loss).
    if (parsed.country !== country || parsed.local !== local) {
      setParts(parsed);
    }
  }, [value, country, local]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        value={country}
        disabled={disabled}
        onChange={(e) => {
          const nextCountry = e.target.value;
          setParts((prev) => ({ ...prev, country: nextCountry }));
          onChange(combinePhone(nextCountry, local));
        }}
        className={cn(
          " text-primary h-11 rounded-md border border-border  px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          selectClassName,
        )}
      >
        {COUNTRY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Input
        value={local}
        disabled={disabled}
        onChange={(e) => {
          const nextLocal = e.target.value.replace(/\D/g, "");
          setParts((prev) => ({ ...prev, local: nextLocal }));
          onChange(combinePhone(country, nextLocal));
        }}
        placeholder={placeholder}
        className={cn(" text-primary flex-1", inputClassName)}
        inputMode="tel"
        autoComplete="tel-national"
      />
    </div>
  );
}
