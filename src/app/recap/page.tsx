import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { listRecaps } from "@/lib/recapRepo";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Lesson Recaps",
  description: "A list of feedback notes from Korean lessons.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Lesson Recaps",
    description: "A list of feedback notes from Korean lessons.",
    images: [{ url: "/kaja-recap.png", width: 1200, height: 630, alt: "Korean Lesson Recap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lesson Recaps",
    description: "A list of feedback notes from Korean lessons.",
    images: ["/kaja-recap.png"],
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default async function RecapsListPage() {
  const recaps = await listRecaps({ limit: 100 });

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Lesson Recaps
        </h1>
        <p className="mt-2 text-muted-foreground">
          A list of feedback notes from Korean lessons.
        </p>

        {recaps.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No recaps yet.</p>
        ) : (
          <ul className="mt-8 divide-y divide-border">
            {recaps.map((recap) => {
              const expressionPreview = recap.expression[0]?.text;
              const vocabCount = recap.vocabulary.length;
              const grammarPreview = recap.grammarPoint[0]?.text;

              return (
                <li key={recap.id}>
                  <Link
                    href={`/recap/${recap.id}`}
                    className="block py-4 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-muted-foreground">
                        {recap.createdAt ? formatDate(recap.createdAt) : "—"}
                      </span>
                      {recap.level && (
                        <span className="text-xs text-muted-foreground">
                          Lv.{recap.level}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {expressionPreview && (
                        <p className="text-foreground truncate">
                          {expressionPreview}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {[
                          vocabCount > 0 && `${vocabCount} words`,
                          grammarPreview && `Grammar: ${grammarPreview}`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No content"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </div>
  );
}
