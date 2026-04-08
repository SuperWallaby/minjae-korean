import { NewsReadingHintBanner } from "@/components/article/NewsReadingHintBanner";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <NewsReadingHintBanner />
    </>
  );
}
