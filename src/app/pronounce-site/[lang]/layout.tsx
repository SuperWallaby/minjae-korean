import {
  normalizeAtlasLangCode,
  PRONOUNCE_PREFIX_LANGS,
} from "@/lib/atlasRoutes";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function PronounceLangLayout({ children, params }: Props) {
  const { lang } = await params;
  const code = normalizeAtlasLangCode(lang);
  if (
    !PRONOUNCE_PREFIX_LANGS.includes(
      code as (typeof PRONOUNCE_PREFIX_LANGS)[number],
    )
  ) {
    notFound();
  }

  return children;
}
