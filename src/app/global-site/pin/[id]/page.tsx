import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGlobalCatalog,
  getGlobalPin,
} from "@/lib/globalSite/catalog";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return getGlobalCatalog().pages.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return {
    title: pin.titleEn,
    description: pin.description,
    openGraph: {
      title: pin.titleEn,
      description: pin.description,
      images: [{ url: pin.imagePath }],
    },
  };
}

export default async function GlobalPinPage({ params }: Props) {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) notFound();

  const partner = (
    pin.partner === "italki" ? "italki" : "preply"
  ) as AffiliatePartner;
  const offer =
    partner === "italki"
      ? "$10 off your first lesson"
      : "50% off your first lesson";
  const goHref = globalGoPath(partner, { lang: pin.lang, pin: pin.id });

  return (
    <>
      <p className="global-crumbs">
        <Link href="/">Home</Link> /{" "}
        <Link href={`/lang/${pin.lang}`}>{pin.langName}</Link> / {pin.titleEn}
      </p>

      <div className="global-pin-layout">
        <div className="global-pin-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pin.imagePath} alt={pin.titleEn} />
        </div>

        <div className="global-pin-copy">
          <h1>{pin.titleEn}</h1>
          <p className="global-pin-lede">{pin.description}</p>

          <ul className="global-word-list">
            {pin.words.map((w) => (
              <li key={`${w.english}-${w.target}`}>
                <span className="global-word-target">{w.target}</span>
                <span className="global-word-roma">
                  {w.romanization ? `[${w.romanization}]` : ""}
                </span>
                <span className="global-word-en">{w.english}</span>
              </li>
            ))}
          </ul>

          <aside className="global-tutor-panel">
            <h2>Practice with a {pin.langName} tutor</h2>
            <p>
              Charts get you started — conversation locks it in. Book a{" "}
              {pin.langName} tutor and use these words in a real lesson.
            </p>
            <p>
              <strong>{offer}</strong> via our partner (opens in a new tab flow).
            </p>
            <a className="global-btn" href={goHref}>
              Continue · {partner === "italki" ? "italki" : "Preply"}
            </a>
          </aside>
        </div>
      </div>
    </>
  );
}
