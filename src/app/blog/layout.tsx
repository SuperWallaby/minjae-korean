import { BlogFirstVisitBanner } from "@/components/blog/BlogFirstVisitBanner";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BlogFirstVisitBanner />
    </>
  );
}
