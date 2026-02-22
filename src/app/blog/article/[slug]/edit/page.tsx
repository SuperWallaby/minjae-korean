import { notFound } from "next/navigation";

import { getBlogPost } from "@/data/blogPosts";
import { BlogEditClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!devOnly()) return notFound();
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return notFound();
  return <BlogEditClient slug={slug} post={post} />;
}
