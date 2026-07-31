import { NO_INDEX_METADATA } from "@/lib/noIndexMetadata";

export const metadata = NO_INDEX_METADATA;

export default function NoIndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
