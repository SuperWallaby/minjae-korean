import type { Metadata } from "next";
import { MixupsLanding } from "@/components/pronounce-site/MixupsLanding";
import { mixupsCopyForLang, mixupsPath } from "@/lib/pronounceMixups";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";

const LANG = "zh";

export async function generateMetadata(): Promise<Metadata> {
  const copy = mixupsCopyForLang(LANG);
  const origin = pronounceSiteOrigin();
  return {
    title: copy.pageTitle,
    description: copy.pageLede,
    alternates: { canonical: `${origin}${mixupsPath(LANG)}` },
  };
}

export default function ZhMixupsPage() {
  return <MixupsLanding lang={LANG} />;
}
