import Link from "next/link";

import { Container } from "@/components/site/Container";
import { grammarChapters } from "@/data/grammarChapters";

export const runtime = "nodejs";

export default function GrammarPage() {
  const { chapters } = grammarChapters;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Grammar
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Grammar chapters for study.
          </p>
        </div>

        <div className="mt-10 divide-y divide-border/70">
          {chapters.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              No chapters yet.
            </div>
          ) : (
            chapters.map((ch) => (
              <Link
                key={ch.number}
                href={`/grammar/${ch.number}`}
                className="block py-6 outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="text-xs text-muted-foreground">
                  Chapter {ch.number}
                </div>
                <div className="mt-2 font-serif text-lg font-semibold tracking-tight">
                  {ch.title}
                </div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
