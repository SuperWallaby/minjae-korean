import { notFound } from "next/navigation";

import { getSong } from "@/lib/songsRepo";
import { SongNewClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function SongNewPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") return notFound();
  const { slug } = await searchParams;
  const initialSong = slug ? await getSong(slug) : undefined;
  return <SongNewClient initialSong={initialSong ?? undefined} />;
}
