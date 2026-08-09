import {
  getGlobalCatalog,
  listGlobalPins,
} from "@/lib/globalSite/catalog";

export default function GlobalHomePage() {
  const catalog = getGlobalCatalog();
  const pins = listGlobalPins();

  return (
    <>
      <section className="global-hero">
        <h1>Vocabulary charts that make language stick</h1>
        <p>
          Free, scannable word lists for English speakers — Spanish, French,
          German, Italian, Arabic, Japanese. Open a chart, learn a handful of
          words, then book a real tutor when you&apos;re ready to practice.
        </p>
        <div className="global-cta-row">
          <a className="global-btn global-btn-hot" href="/go/preply">
            Book a tutor · 50% off first lesson
          </a>
          <a className="global-btn global-btn-secondary" href="#charts">
            Browse charts
          </a>
        </div>
      </section>

      <div className="global-lang-grid">
        {catalog.languages.map((lang) => {
          const count = pins.filter((p) => p.lang === lang.code).length;
          return (
            <a
              key={lang.code}
              className="global-lang-chip"
              href={`/lang/${lang.code}`}
            >
              <strong>{lang.name}</strong>
              <span>
                {count} chart{count === 1 ? "" : "s"}
              </span>
            </a>
          );
        })}
      </div>

      <h2 id="charts" className="global-section-title">
        Latest charts
      </h2>
      <div className="global-pin-grid">
        {pins.map((pin) => (
          <a key={pin.id} className="global-pin-card" href={`/pin/${pin.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pin.imagePath} alt={pin.titleEn} loading="lazy" />
            <div className="global-pin-card-body">
              <h2>{pin.titleEn}</h2>
              <div className="global-pin-card-meta">{pin.langName}</div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
