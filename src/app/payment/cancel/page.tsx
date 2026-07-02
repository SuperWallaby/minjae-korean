import Link from "next/link";
import { Suspense } from "react";

import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

export default function PaymentCancelPage() {
  return (
    <MarketingPage containerClassName="max-w-2xl">
      <MarketingShell>
        <MarketingShellBody>
          <div className="font-serif text-2xl font-semibold tracking-tight text-[var(--quiz-text)]">
            Payment cancelled
          </div>
          <div className="mt-3 text-sm text-[var(--quiz-text-sub)]">
            No worries—nothing was charged. You can try again anytime.
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Suspense fallback={<Button disabled>Try again</Button>}>
              <CheckoutButton product="single">Try again</CheckoutButton>
            </Suspense>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
