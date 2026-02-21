import { notFound } from "next/navigation";

import { SongNewClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SongNewPage() {
  if (process.env.NODE_ENV === "production") return notFound();
  return <SongNewClient />;
}
