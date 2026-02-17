import { notFound } from "next/navigation";

import { ArticleEditClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ArticleEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV === "production") return notFound();
  const { slug } = await params;
  return <ArticleEditClient slug={slug} />;
}

