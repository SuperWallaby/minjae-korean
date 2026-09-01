import type { Metadata } from "next";
import Link from "next/link";

import { BlogInnerPage } from "@/components/site/BlogInnerPage";
import homeStyles from "@/components/site/home-blog.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <BlogInnerPage containerClassName="max-w-2xl">
      <p className={homeStyles.sectionLabel}>404</p>
      <h1 className={homeStyles.sectionTitle}>Page not found</h1>
      <p className={homeStyles.sectionBody}>
        The page may have moved, or the link may be out of date.
      </p>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className={homeStyles.textLink}>
          Home
        </Link>
        <Link href="/blog" className={homeStyles.textLink}>
          Blog
        </Link>
        <Link href="/vocab-quiz" className={homeStyles.textLink}>
          Play Game
        </Link>
      </div>
    </BlogInnerPage>
  );
}
