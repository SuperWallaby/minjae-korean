import Link from "next/link";

import { Container } from "@/components/site/Container";
import { posts } from "@/lib/posts";

export default function PostsPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Posts
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Short notes on speaking practice, pronunciation, and natural phrasing.
        </p>

        <div className="mt-10 divide-y divide-border/70">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/posts/${p.slug}`}
              className="block py-6 outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{new Date(p.dateISO).toLocaleDateString()}</span>
                <span>·</span>
                <span>{p.readingTimeMin} min</span>
              </div>
              <div className="mt-2 font-serif text-lg font-semibold tracking-tight">
                {p.title}
              </div>
              <div className="mt-2 text-sm leading-7 text-muted-foreground">
                {p.excerpt}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

