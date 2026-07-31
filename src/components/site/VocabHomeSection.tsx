import Link from "next/link";

import { Container } from "@/components/site/Container";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

const HUBS = [
  {
    href: "/vocab",
    title: "Picture vocab charts",
    description: "Learn related words and everyday phrases from visual study cards.",
  },
  {
    href: "/vocab/detail?tab=how-to-say",
    title: "How to say it",
    description: "Pictures, pronunciation, explanations, and example sentences.",
  },
  {
    href: "/vocab/detail",
    title: "Word differences",
    description: "See how similar Korean words differ and when each one fits.",
  },
] as const;

export function VocabHomeSection() {
  return (
    <section className="py-6 sm:py-10">
      <Container>
        <StaggerReveal className="rounded-4xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-6 py-8 shadow-(--shadow-float) sm:px-10 sm:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--quiz-text-muted)]">
              Visual vocabulary
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
              Learn Korean words in context
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--quiz-text-sub)] sm:text-base">
              Start with a picture, hear the Korean, then explore examples and
              the small differences that translations miss.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {HUBS.map((hub) => (
              <Link
                key={hub.href}
                href={hub.href}
                className="rounded-[1.125rem] border border-blue-200 bg-blue-50/60 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="font-semibold text-[var(--quiz-text)]">
                  {hub.title}
                </p>
                <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                  {hub.description}
                </p>
              </Link>
            ))}
          </div>

          <p className="mt-5 text-sm">
            <Link
              href="/vocab"
              className="font-medium text-blue-800 underline hover:text-blue-950"
            >
              Browse all vocab charts →
            </Link>
          </p>
        </StaggerReveal>
      </Container>
    </section>
  );
}
