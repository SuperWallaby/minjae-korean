import Link from "next/link";
import {
  pronouncePinCardImagePath,
  pronouncePinFocusTerm,
  pronouncePinPath,
  type PronouncePinPage,
} from "@/lib/pronounceSite/catalog";

export function PronouncePinCard({
  pin,
  priority = false,
}: {
  pin: PronouncePinPage;
  priority?: boolean;
}) {
  const focus = pronouncePinFocusTerm(pin);
  const py = pin.words?.[0]?.pinyin;
  return (
    <Link className="global-pin-card sound-related-card" href={pronouncePinPath(pin)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pronouncePinCardImagePath(pin.imagePath)}
        alt={`How to pronounce ${focus}${py ? ` (${py})` : ""}`}
        width={480}
        height={720}
        sizes="(max-width: 720px) 42vw, 220px"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="global-pin-card-body">
        <h3>
          {focus}
          {py ? <span className="global-pin-card-meta"> · {py}</span> : null}
        </h3>
        <div className="global-pin-card-meta">{pin.words?.[0]?.english || "listen"}</div>
      </div>
    </Link>
  );
}
