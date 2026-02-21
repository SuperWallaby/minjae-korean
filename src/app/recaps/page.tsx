import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { listRecaps } from "@/lib/recapRepo";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Recaps",
  description: "Open lesson recaps: expressions, vocabulary, and grammar from Korean lessons.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Recaps | Kaja",
    description: "Open lesson recaps: expressions, vocabulary, and grammar from Korean lessons.",
    images: [{ url: "/kaja-recap.png", width: 1200, height: 630, alt: "Korean Lesson Recap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recaps | Kaja",
    description: "Open lesson recaps: expressions, vocabulary, and grammar from Korean lessons.",
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

export default async function RecapsPage() {
  const recaps = await listRecaps({ limit: 100 });

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Recaps
        </h1>
        <p className="mt-2 text-muted-foreground">
          Lesson recaps are open: expressions, vocabulary, and grammar from sessions. Click a recap to view the full note.
        </p>

        {recaps.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No recaps yet.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {recaps.map((recap) => {
              const expressionPreview = recap.expression[0]?.text;
              const vocabCount = recap.vocabulary.length;
              const grammarPreview = recap.grammarPoint[0]?.text;

              return (
                <li key={recap.id}>
                  <Link href={`/recap/${recap.id}`} className="block h-full">
                    <Card className="h-full transition-shadow hover:shadow-(--shadow-float)">
                      <CardContent className="p-5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-muted-foreground">
                            {recap.createdAt ? formatDate(recap.createdAt) : "—"}
                          </span>
                          {recap.level != null && (
                            <span className="text-xs rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                              Lv.{recap.level}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-1">
                          {expressionPreview ? (
                            <p className="line-clamp-2 text-foreground">
                              {expressionPreview}
                            </p>
                          ) : null}
                          <p className="text-sm text-muted-foreground">
                            {[
                              vocabCount > 0 ? `${vocabCount} words` : null,
                              grammarPreview ? `Grammar: ${grammarPreview}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No content"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
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
