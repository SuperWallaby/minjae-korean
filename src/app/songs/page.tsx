import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNewsDate } from "@/lib/levelDisplay";
import { listSongs } from "@/lib/songsRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export default async function SongsPage() {
  const items = await listSongs(100);
  const isDev = devOnly();
  const major = items[0];
  const rest = items.slice(1);

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Songs
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Learn Korean through music. Click on lyrics to see translations and explanations.
            </p>
          </div>
          {isDev ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/songs/new">New song</Link>
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No songs yet.
          </div>
        ) : (
          <>
            {major ? (
              <Link
                href={`/songs/${encodeURIComponent(major.slug)}`}
                className="group mt-10 block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 sm:aspect-2/1">
                  {major.imageLarge?.trim() || major.imageThumb?.trim() ? (
                    <Image
                      src={
                        major.imageLarge?.trim() ||
                        major.imageThumb?.trim() ||
                        ""
                      }
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 1024px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-6xl">🎵</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                      {major.level || "A1"}
                    </span>
                    <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                      {major.title}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                      {major.artist}
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}

            {rest.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/songs/${encodeURIComponent(s.slug)}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                      {s.imageThumb?.trim() || s.imageLarge?.trim() ? (
                        <Image
                          src={
                            s.imageThumb?.trim() || s.imageLarge?.trim() || ""
                          }
                          alt=""
                          fill
                          className="object-cover transition group-hover:scale-[1.02]"
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-4xl">🎵</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <Badge variant="muted" className="w-fit">
                        {s.level || "A1"}
                      </Badge>
                      <h3 className="mt-2 font-serif font-semibold tracking-tight line-clamp-2">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.artist}
                      </p>
                      {s.createdAt ? (
                        <p className="mt-auto pt-2 text-xs text-muted-foreground">
                          {formatNewsDate(s.createdAt)}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </Container>
    </div>
  );
}
