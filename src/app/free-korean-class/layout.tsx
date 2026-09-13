import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "30-minute free trial" },
  description:
    "Learn Korean 1-on-1 with Minjae. Try your first 30-minute Korean lesson for free. After the trial, tutoring is $5 per session.",
};

export default function FreeKoreanClassLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
