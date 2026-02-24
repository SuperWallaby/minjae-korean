import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Container } from "@/components/site/Container";
import { BookmarkListClient } from "@/components/article/BookmarkListClient";

export const runtime = "nodejs";

export default function BookmarksPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <Breadcrumb items={[{ label: "Saved articles", href: "/bookmarks" }]} />
        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Saved bookmarks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Articles you bookmarked from Blog and News.
        </p>
        <BookmarkListClient className="mt-8" />
      </Container>
    </div>
  );
}
