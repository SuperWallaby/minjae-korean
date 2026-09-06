import Link from "next/link";
import { MixupsSubscribeForm } from "@/components/pronounce-site/MixupsSubscribeForm";
import { MIXUPS_COPY, MIXUPS_PATH } from "@/lib/pronounceMixups";

type Props = { pinId?: string };

export function MixupsSubscribeBanner({ pinId }: Props) {
  const source = pinId
    ? `getpronounce_mixups_banner:${pinId}`
    : "getpronounce_mixups_banner";

  return (
    <aside className="mixups-banner" aria-labelledby="mixups-banner-title">
      <p className="mixups-banner-kicker">{MIXUPS_COPY.kicker}</p>
      <h2 id="mixups-banner-title" className="mixups-banner-title">
        {MIXUPS_COPY.bannerTitle}
      </h2>
      <p className="mixups-banner-body">{MIXUPS_COPY.bannerBody}</p>
      <MixupsSubscribeForm source={source} compact />
      <p className="mixups-banner-more">
        <Link href={MIXUPS_PATH}>{MIXUPS_COPY.howItWorks}</Link>
      </p>
    </aside>
  );
}
