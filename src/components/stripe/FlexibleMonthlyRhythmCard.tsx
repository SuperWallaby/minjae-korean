"use client";

import * as React from "react";
import Image from "next/image";
import { Suspense } from "react";

import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  MONTHLY_RHYTHM_OPTIONS,
  RHYTHM_PER_SESSION_DISPLAY,
} from "@/data/pricing";

export function FlexibleMonthlyRhythmCard() {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
        <div className="flex items-center gap-3 h-11">
          <div className="grid p-2 place-items-center rounded-2xl bg-(--included-3)/60">
            <Image
              width={35}
              height={25}
              src="/stars.webp"
              alt="Growth Program"
              className="text-foreground/80"
            />
          </div>
          <div className="font-serif text-base font-semibold tracking-tight">
            Growth Program
          </div>
        </div>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight">
            {RHYTHM_PER_SESSION_DISPLAY}
          </span>
          <span className="text-sm text-muted-foreground">per coaching</span>
        </div>
        <div className="mt-3 text-sm leading-7 text-muted-foreground">
          Meet regularly with Minjae and keep your Korean moving forward. Clear
          direction, consistent practice, and encouragement along the way.
        </div>
        <div className="mt-8 flex flex-1 flex-col justify-between">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Book a time when you want coaching</li>
            <li>• Step-by-step growth, customized for you</li>
            <li>• Focus on your needs, goals, and progress</li>
            <li>• Billed monthly</li>
          </ul>
          <div className="pt-6">
            <Button
              size="sm"
              variant="primary"
              className="font-serif w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              Choose plan
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Growth Program"
        description="Pick how often you want to practice per week. You’ll be charged monthly."
        footer={
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          {MONTHLY_RHYTHM_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3"
            >
              <div>
                <div className="font-semibold text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground">
                  {opt.description}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold tracking-tight">
                  {opt.amountDisplay}
                  <span className="text-xs font-normal text-muted-foreground">
                    /month
                  </span>
                </span>
                <Suspense
                  fallback={
                    <Button size="sm" disabled>
                      Select
                    </Button>
                  }
                >
                  <CheckoutButton
                    product={
                      `monthly_${opt.id}` as
                        | "monthly_1x"
                        | "monthly_2x"
                        | "monthly_3x"
                    }
                    size="sm"
                    variant="primary"
                    className="font-serif shrink-0"
                  >
                    Select
                  </CheckoutButton>
                </Suspense>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
