import Link from "next/link";

export type GrammarHubId = "compare" | "meaning" | "usage" | "how-to-say";

const HUBS: {
  id: GrammarHubId;
  href: string;
  title: string;
  description: string;
}[] = [
  {
    id: "compare",
    href: "/grammar/compare",
    title: "Word comparisons",
    description: "Easily confused particles and connectors — side by side.",
  },
  {
    id: "meaning",
    href: "/grammar/meaning",
    title: "What does it mean?",
    description: "Clear meaning guides for words and patterns learners search for.",
  },
  {
    id: "usage",
    href: "/grammar/usage",
    title: "How to use",
    description: "When and how native speakers actually use it.",
  },
  {
    id: "how-to-say",
    href: "/grammar/how-to-say",
    title: "How to say it",
    description: "Everyday English phrases — the natural Korean way to say them.",
  },
];

type Props = {
  current?: GrammarHubId;
};

export function GrammarHubCrossLinks({ current }: Props) {
  const hubs = current ? HUBS.filter((hub) => hub.id !== current) : HUBS;

  return (
    <nav
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Explore grammar guides"
    >
      {hubs.map((hub) => (
        <Link
          key={hub.id}
          href={hub.href}
          className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
        >
          <p className="font-semibold text-[var(--quiz-text)]">{hub.title}</p>
          <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">{hub.description}</p>
        </Link>
      ))}
    </nav>
  );
}
