import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards",
  robots: { index: false, follow: false },
};

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-white print:static print:min-h-0">
      {children}
    </div>
  );
}
