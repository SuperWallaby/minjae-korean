import { notFound } from "next/navigation";

import { ArticleNewClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ArticleNewPage() {
  if (process.env.NODE_ENV === "production") return notFound();
  return <ArticleNewClient />;
}

