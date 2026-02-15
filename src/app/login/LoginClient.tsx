"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

export function LoginClient() {
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const session = useMockSession();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sendLink = async () => {
    setLoading(true);
    setError(null);
    const res = await session.requestMagicLink({ email, next });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-xl mt-4">
        <Card className="mt-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--included-3)_45%,transparent),transparent)]" />

          <CardHeader className="mb-2 relative items-center text-center">
              {/* <ShieldCheck className="size-7 text-foreground/70" /> */}
              <img src="/signin.png" alt="Kaja Logo" className="w-24 mx-auto" />
            <CardTitle className="text-2xl mt-4">Welcome to Kaja</CardTitle>
            <CardDescription className="w-full max-w-sm mx-auto text-center">
              Join as a member, talk with Minjae, book a time, recap notes, and more.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <div className="grid gap-3">
              <Button asChild className="w-full" size="lg">
                <Link
                  href={`/api/auth/google/start?next=${encodeURIComponent(next)}`}
                >
                  Continue with Google
                </Link>
              </Button>

              <div className="my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <div className="text-xs text-muted-foreground">or</div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <label className="grid gap-1">
                <span className="text-xs text-muted-foreground">Email</span>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                  disabled={loading || sent}
                />
              </label>
              <Button
                className="w-full justify-center"
                size="lg"
                variant="primary"
                onClick={() => void sendLink()}
                disabled={loading || sent}
              >
                {sent ? "Login link sent" : loading ? "Sending…" : "Send login link"}
              </Button>

              {sent ? (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Check your inbox. Click the link to sign in.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : null}

              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href={next}>Back</Link>
              </Button>
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "} <br></br>
              <Link href="/terms" className="text-primary underline underline-offset-4 hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-4 hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

