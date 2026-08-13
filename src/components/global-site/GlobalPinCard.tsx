import Link from "next/link";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import {
  globalLangMeta,
  type GlobalPinPage,
} from "@/lib/globalSite/catalog";

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
  const native = globalLangMeta(pin.lang).native;
  return (
    <Link
      className="global-pin-card"
      href={`/pin/${pin.id}`}
      data-lang={pin.lang}
    >
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
          {meta || `${native} · ${pin.langName}`}
        </div>
      </div>
    </Link>
  );
}
