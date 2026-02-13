import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

export default function PaymentCancelPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="font-serif text-2xl font-semibold tracking-tight">Payment cancelled</div>
          <div className="mt-3 text-sm text-muted-foreground">
            No worries—nothing was charged. You can try again anytime.
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Suspense fallback={<Button disabled>Try again</Button>}>
              <CheckoutButton product="single">Try again</CheckoutButton>
            </Suspense>
            <Button asChild variant="outline">
              <Link href="/#ways-to-use">Back</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

