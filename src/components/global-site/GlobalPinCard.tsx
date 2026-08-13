import Link from "next/link";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import type { GlobalPinPage } from "@/lib/globalSite/catalog";

type Props = {
  pin: GlobalPinPage;
  priority?: boolean;
  meta?: string;
  heading?: "h2" | "h3";
};

export function GlobalPinCard({
  pin,
  priority = false,
  meta,
  heading = "h2",
}: Props) {
  const Heading = heading;
  return (
    <Link className="global-pin-card" href={`/pin/${pin.id}`}>
      <GlobalPinImage
        imagePath={pin.imagePath}
        alt={`${pin.titleEn} vocabulary chart`}
        variant="card"
        priority={priority}
        width={480}
        height={720}
      />
      <div className="global-pin-card-body">
        <Heading>{pin.titleEn}</Heading>
        <div className="global-pin-card-meta">
          {meta || pin.langName}
        </div>
      </div>
    </Link>
  );
}
