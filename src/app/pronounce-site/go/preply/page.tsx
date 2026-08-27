import { GlobalAffiliateGoClient } from "@/components/global-site/GlobalAffiliateGoClient";
import { buildAffiliateDestination } from "@/lib/globalSite/affiliate";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ lang?: string; pin?: string }>;
};

export default async function GlobalGoPreplyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lang = sp.lang?.trim() || undefined;
  const pinId = sp.pin?.trim() || undefined;
  const destination = buildAffiliateDestination({
    partner: "preply",
    lang,
    pinId,
    campaign: "global-go-preply",
  });

  return (
    <GlobalAffiliateGoClient
      partner="preply"
      destination={destination}
      lang={lang}
      pinId={pinId}
    />
  );
}
