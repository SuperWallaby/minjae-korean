import type { Metadata } from "next";
import { MixupsLanding } from "@/components/pronounce-site/MixupsLanding";
import {
  normalizeAtlasLangCode,
  PRONOUNCE_PREFIX_LANGS,
} from "@/lib/atlasRoutes";
import { mixupsCopyForLang, mixupsPath } from "@/lib/pronounceMixups";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const code = normalizeAtlasLangCode(lang);
  if (
    !PRONOUNCE_PREFIX_LANGS.includes(
      code as (typeof PRONOUNCE_PREFIX_LANGS)[number],
    )
  ) {
    return { title: "Mix-ups" };
  }
  const copy = mixupsCopyForLang(code);
  const origin = pronounceSiteOrigin();
  return {
    title: copy.pageTitle,
    description: copy.pageLede,
    alternates: { canonical: `${origin}${mixupsPath(code)}` },
  };
}

export default async function MixupsPage({ params }: Props) {
  const { lang } = await params;
  const code = normalizeAtlasLangCode(lang);
  if (
    !PRONOUNCE_PREFIX_LANGS.includes(
      code as (typeof PRONOUNCE_PREFIX_LANGS)[number],
    )
  ) {
    notFound();
  }
  return <MixupsLanding lang={code} />;
}
