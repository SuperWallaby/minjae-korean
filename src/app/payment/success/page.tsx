import Link from "next/link";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="font-serif text-2xl font-semibold tracking-tight">Payment successful</div>
          <div className="mt-3 text-sm text-muted-foreground">
            Thanks! Your credits will appear in your account shortly.
          </div>
          {sessionId ? (
            <div className="mt-3 text-xs text-muted-foreground">Session: {sessionId}</div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/booking">Book a time</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

