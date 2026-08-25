import { GlobalAffiliateGoClient } from "@/components/global-site/GlobalAffiliateGoClient";
import { buildAffiliateDestination } from "@/lib/globalSite/affiliate";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ lang?: string; pin?: string }>;
};

export default async function SoundGoPreplyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pinId = sp.pin?.trim() || undefined;
  const destination = buildAffiliateDestination({
    partner: "preply",
    lang: "en",
    pinId,
    campaign: "sound-go-preply",
    source: "eigosound",
  });

  return (
    <GlobalAffiliateGoClient
      partner="preply"
      destination={destination}
      lang="en"
      pinId={pinId}
      hopText="Taking you to Preply…"
    />
  );
}
