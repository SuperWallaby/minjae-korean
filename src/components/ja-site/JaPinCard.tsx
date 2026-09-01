import Link from "next/link";

import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";

export type JaPinCardModel = {
  id: string;
  titleJa: string;
  imagePath: string;
  wordCount: number;
};

type Props = {
  pin: JaPinCardModel;
  priority?: boolean;
  meta?: string;
  heading?: "h2" | "h3";
};

export function JaPinCard({
  pin,
  priority = false,
  meta,
  heading: Heading = "h2",
}: Props) {
  return (
    <Link
      className="global-pin-card"
      href={`/pin/${encodeURIComponent(pin.id)}`}
      lang="ja"
    >
      <GlobalPinImage
        imagePath={pin.imagePath}
        alt={`${pin.titleJa} 英単語チャート`}
        variant="card"
        priority={priority}
        width={480}
        height={720}
      />
      <div className="global-pin-card-body">
        <Heading>{pin.titleJa}</Heading>
        <div className="global-pin-card-meta">
          {meta || `英語 · ${pin.wordCount}語`}
        </div>
      </div>
    </Link>
  );
}
