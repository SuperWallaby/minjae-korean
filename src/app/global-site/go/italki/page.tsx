import { GlobalAffiliateGoClient } from "@/components/global-site/GlobalAffiliateGoClient";
import { buildAffiliateDestination } from "@/lib/globalSite/affiliate";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ lang?: string; pin?: string }>;
};

export default async function GlobalGoItalkiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lang = sp.lang?.trim() || undefined;
  const pinId = sp.pin?.trim() || undefined;
  const destination = buildAffiliateDestination({
    partner: "italki",
    lang,
    pinId,
    campaign: "global-go-italki",
  });

  return (
    <GlobalAffiliateGoClient
      partner="italki"
      destination={destination}
      lang={lang}
      pinId={pinId}
    />
  );
}
