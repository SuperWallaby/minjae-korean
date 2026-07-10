import Link from "next/link";

import { Container } from "@/components/site/Container";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

const HUBS = [
  {
    href: "/grammar/compare",
    title: "Word comparisons",
    description: "Side-by-side guides for easily confused Korean words and grammar.",
  },
  {
    href: "/grammar/meaning",
    title: "What does it mean?",
    description: "Meaning guides for the words and patterns learners search for.",
  },
  {
    href: "/grammar/usage",
    title: "How to use",
    description: "Practical usage guides — when native speakers actually use it.",
  },
  {
    href: "/grammar/how-to-say",
    title: "How to say it",
    description: "Everyday English phrases — the natural Korean way to say them.",
  },
] as const;

export function GrammarHomeSection() {
  return (
    <section className="py-6 sm:py-10">
      <Container>
        <StaggerReveal className="rounded-4xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-6 py-8 shadow-(--shadow-float) sm:px-10 sm:py-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--quiz-text-muted)]">
              Grammar library
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
              Learn Korean grammar with nuance
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--quiz-text-sub)] sm:text-base">
              Comparisons, meaning, usage, and how-to-say guides — each with real examples and a
              quick quiz.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HUBS.map((hub) => (
              <Link
                key={hub.href}
                href={hub.href}
                className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                <p className="font-semibold text-[var(--quiz-text)]">{hub.title}</p>
                <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">{hub.description}</p>
              </Link>
            ))}
          </div>

          <p className="mt-5 text-sm">
            <Link
              href="/grammar"
              className="font-medium text-emerald-800 underline hover:text-emerald-950"
            >
              Browse chapter library →
            </Link>
          </p>
        </StaggerReveal>
      </Container>
    </section>
  );
}
