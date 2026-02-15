"use client";

import * as React from "react";
import Link from "next/link";
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
  const [phoneNumber, setPhoneNumber] = React.useState(initialContact.phoneNumber);

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm time"
      description="Use this time slot?"
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
            {isSubmitting ? "Confirming…" : "Confirm"}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-muted-foreground">
        <div>
          <span className="text-lg font-semibold text-primary">
            {selectedLabel ?? "-"}
          </span>
        </div>
        <div className="text-sm font-semibold text-foreground">Contact info</div>
        {/* Mobile small loading label while submitting */}
        {isSubmitting && (
          <div className="sm:hidden text-xs text-muted-foreground">Loading…</div>
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
            <span className="text-xs text-muted-foreground">Phone (optional)</span>
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
        <div className="text-xs text-muted-foreground">
          Having trouble?{" "}
          <Link href="/account" className="underline underline-offset-2">
            Update your profile
          </Link>
          .
        </div>
      </div>
    </Modal>
  );
}

