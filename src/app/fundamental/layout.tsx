import { NO_INDEX_METADATA } from "@/lib/noIndexMetadata";

export const metadata = NO_INDEX_METADATA;

export default function FundamentalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
