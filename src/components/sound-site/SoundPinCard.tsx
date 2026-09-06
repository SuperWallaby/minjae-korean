import Link from "next/link";
import {
  soundPinCardImagePath,
  soundPinPath,
  type SoundPinPage,
} from "@/lib/soundSite/catalog";
import { soundPinSeoTitle } from "@/lib/soundSite/seo";

type Props = {
  pin: SoundPinPage;
  heading?: "h2" | "h3";
};

/** Related/home card — uses ~15–25KB `.card.webp`, lazy by default. */
export function SoundPinCard({ pin, heading = "h3" }: Props) {
  const Heading = heading;
  const title = soundPinSeoTitle(pin);
  const src = soundPinCardImagePath(pin.imagePath);

  return (
    <Link className="global-pin-card sound-related-card" href={soundPinPath(pin)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} chart`}
        width={480}
        height={720}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
      <div className="global-pin-card-body">
        <Heading>{title}</Heading>
        <div className="global-pin-card-meta">
          {pin.words?.length || 0} words · listen
        </div>
      </div>
    </Link>
  );
}
