import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { BookmarkListClient } from "@/components/article/BookmarkListClient";
import { Breadcrumb } from "@/components/site/Breadcrumb";

export const runtime = "nodejs";

export default function BookmarksPage() {
  return (
    <MarketingPage containerClassName="max-w-2xl">
      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb items={[{ label: "Saved articles", href: "/bookmarks" }]} />
          <MarketingHeader
            className="mt-4"
            title="Saved bookmarks"
            lead="Articles you bookmarked from Blog and News."
            titleAs="h1"
          />
          <BookmarkListClient className="mt-8" />
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
