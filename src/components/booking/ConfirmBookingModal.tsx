"use client";

import * as React from "react";
import { CheckCircle } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DEFAULT_PHONE_COUNTRY,
  PhonePartsInput,
} from "@/components/ui/PhonePartsInput";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export type ConfirmBookingContact = {
  name: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
};

export function ConfirmBookingModal(props: {
  open: boolean;
  onClose: () => void;
  selectedLabel: string | null;
  disabled?: boolean;
  initialContact: ConfirmBookingContact;
  onConfirm: (contact: ConfirmBookingContact) => void | Promise<void>;
}) {
  const { open, onClose, selectedLabel, disabled, initialContact, onConfirm } =
    props;
  const [dirty, setDirty] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState(initialContact.name);
  const [email, setEmail] = React.useState(initialContact.email);
  const [phoneCountry, setPhoneCountry] = React.useState(
    initialContact.phoneCountry || DEFAULT_PHONE_COUNTRY,
  );
  const [phoneNumber, setPhoneNumber] = React.useState(
    initialContact.phoneNumber,
  );

  React.useEffect(() => {
    if (!open) {
      setDirty(false);
      return;
    }
    if (dirty) return;
    setName(initialContact.name);
    setEmail(initialContact.email);
    setPhoneCountry(initialContact.phoneCountry || DEFAULT_PHONE_COUNTRY);
    setPhoneNumber(initialContact.phoneNumber);
  }, [dirty, initialContact, open]);

  const displayLabel = React.useMemo(() => {
    if (!selectedLabel) return "-";
    // Try to parse patterns like "Mon 2/16 · 09:30–09:55" or "Mon, Feb 16 · 09:30–09:55"
    // We'll extract month/day and times when possible and format as requested.
    try {
      // Normalize delimiter
      const s = String(selectedLabel).trim();
      // Patterns:
      // 1) Mon 2/16 · 09:30–09:55
      // 2) Mon, Feb 16 · 09:30–09:55
      const re1 =
        /^([A-Za-z]{3}),?\s+(\d{1,2})\/(\d{1,2})\s*·\s*(\d{1,2}:\d{2})–(\d{1,2}:\d{2})$/;
      const re2 =
        /^([A-Za-z]{3}),?\s+([A-Za-z]+)\s+(\d{1,2})\s*·\s*(\d{1,2}:\d{2})–(\d{1,2}:\d{2})$/;
      const m1 = s.match(re1);
      const m2 = s.match(re2);
      let month: number | null = null;
      let day: number | null = null;
      let start = "";
      let end = "";
      if (m1) {
        month = Number(m1[2]);
        day = Number(m1[3]);
        start = m1[4];
        end = m1[5];
      } else if (m2) {
        // parse month name to number
        const monthName = m2[2];
        const monthDate = new Date(`${monthName} 1, 2000`);
        if (!isNaN(monthDate.getTime())) month = monthDate.getMonth() + 1;
        day = Number(m2[3]);
        start = m2[4];
        end = m2[5];
      } else {
        return s;
      }
      if (!month || !day) return String(selectedLabel);
      const now = new Date();
      const year = now.getFullYear();
      const candidate = new Date(year, month - 1, day);
      const isToday =
        candidate.getFullYear() === now.getFullYear() &&
        candidate.getMonth() === now.getMonth() &&
        candidate.getDate() === now.getDate();
      if (isToday) {
        return `Today, ${start}–${end}`;
      }
      // Format like "Mon, Feb 16 · 10:00–10:25"
      const weekday = candidate.toLocaleDateString(undefined, {
        weekday: "short",
      });
      const monthName = candidate.toLocaleDateString(undefined, {
        month: "short",
      });
      return `${weekday}, ${monthName} ${day} · ${start}–${end}`;
    } catch {
      return selectedLabel;
    }
  }, [selectedLabel]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review & book"
      description="You’re almost done."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              const nextName = name.trim();
              if (!nextName) {
                alert("Please enter your name.");
                return;
              }
              const nextEmail = email.trim().toLowerCase();
              if (!nextEmail || !isEmail(nextEmail)) {
                alert("Please enter a valid email address.");
                return;
              }
              const digits = String(phoneNumber ?? "").replace(/\D/g, "");
              if (digits && digits.length < 6) {
                alert("Please enter a valid phone number.");
                return;
              }
              try {
                setIsSubmitting(true);
                await onConfirm({
                  name: nextName,
                  email: nextEmail,
                  phoneCountry: (phoneCountry || DEFAULT_PHONE_COUNTRY).trim(),
                  phoneNumber: digits,
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={disabled || isSubmitting}
            aria-busy={isSubmitting || undefined}
          >
            {isSubmitting ? "Booking…" : "Book session"}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-muted-foreground">
        <div>
          <div className="text-sm  font-semibold mb-2 text-foreground">
            Session time
          </div>
          <span className="text-lg font-semibold text-primary">
            {displayLabel ?? "-"}
          </span>
        </div>
        <div className="mt-4 text-sm font-semibold text-foreground">
          Contact info
        </div>
        {/* Mobile small loading label while submitting */}
        {isSubmitting && (
          <div className="sm:hidden text-xs text-muted-foreground">
            Loading…
          </div>
        )}
        <div className="mt-2 grid gap-2">
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <Input
              value={name}
              onChange={(e) => {
                setDirty(true);
                setName(e.target.value);
              }}
              placeholder="Your name"
              disabled={disabled}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <Input
              value={email}
              onChange={(e) => {
                setDirty(true);
                setEmail(e.target.value);
              }}
              placeholder="you@example.com"
              disabled={disabled}
              inputMode="email"
              autoComplete="email"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">
              Phone{" "}
              <span className="text-[10px] text-muted-foreground/70">
                (optional)
              </span>
            </span>
            <PhonePartsInput
              country={phoneCountry}
              number={phoneNumber}
              disabled={disabled}
              onChange={(next) => {
                setDirty(true);
                setPhoneCountry(next.country.trim() || DEFAULT_PHONE_COUNTRY);
                setPhoneNumber(next.number);
              }}
              placeholder="Local number"
            />
          </label>
        </div>
        <div className="rounded-md border flex items-center gap-2 border-border bg-muted/40 p-3">
          <CheckCircle strokeWidth={1.5} className="w-4 h-4 " />
          Cancellations are allowed up to 1 hour before the session.
        </div>
        {/* <div className="text-xs text-muted-foreground">
          Having trouble?{" "}
          <Link href="/account" className="underline underline-offset-2">
            Update your profile
          </Link>
          .
        </div> */}
      </div>
    </Modal>
  );
}
