import {
  BlogInnerPage,
} from "@/components/site/BlogInnerPage";
import { BookmarkListClient } from "@/components/article/BookmarkListClient";
import homeStyles from "@/components/site/home-blog.module.css";

export const runtime = "nodejs";

export default function BookmarksPage() {
  return (
    <BlogInnerPage containerClassName="max-w-2xl">
      <h1 className={homeStyles.sectionTitle}>Saved bookmarks</h1>
      <p className={homeStyles.sectionBody}>
        Articles you bookmarked from the blog.
      </p>
      <BookmarkListClient className="mt-8" />
    </BlogInnerPage>
  );
}
