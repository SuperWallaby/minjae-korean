import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return notFound();

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <div className="text-xs text-muted-foreground">
          {new Date(post.dateISO).toLocaleDateString()} · {post.readingTimeMin} min
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {post.excerpt}
        </p>

        <article className="mt-10 space-y-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {post.body.split("\n\n").map((para) => (
            <p key={para}>{para}</p>
          ))}
        </article>
      </Container>
    </div>
  );
}

