import Link from "next/link";
import { MixupsSubscribeForm } from "@/components/pronounce-site/MixupsSubscribeForm";
import { atlasLangPath } from "@/lib/atlasRoutes";
import {
  mixupsCopyForLang,
  mixupsExamplesForLang,
} from "@/lib/pronounceMixups";

export function MixupsLanding({ lang }: { lang: string }) {
  const copy = mixupsCopyForLang(lang);
  const examples = mixupsExamplesForLang(lang);

  return (
    <article className="mixups-page" data-lang={copy.lang}>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href={atlasLangPath(copy.lang)}>Home</Link>
        <span aria-hidden> / </span>
        <span>Mix-ups</span>
      </nav>

      <p className="mixups-banner-kicker">{copy.kicker}</p>
      <h1>{copy.pageTitle}</h1>
      <p className="global-pin-lede mixups-page-lede">{copy.pageLede}</p>

      {examples.length > 0 ? (
        <ul className="mixups-pairs">
          {examples.map((row) => (
            <li key={row.contrast}>
              <span className="mixups-pairs-label">{row.contrast}</span>
              <span className="mixups-pairs-word">
                <strong>{row.left.word}</strong>
                <em>[{row.left.rom}]</em>
                {row.left.en}
              </span>
              <span className="mixups-pairs-vs" aria-hidden>
                /
              </span>
              <span className="mixups-pairs-word">
                <strong>{row.right.word}</strong>
                <em>[{row.right.rom}]</em>
                {row.right.en}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mixups-page-promise">
        <h2>What shows up in the email</h2>
        <ol>
          <li>One mix-up pair — two words, so you can hear the contrast.</li>
          <li>{copy.promiseWords}</li>
        </ol>
        <p>
          Confirmation today. The first audio set goes out on the next weekly
          send.
        </p>
      </section>

      <MixupsSubscribeForm
        source={`getpronounce_mixups_page:${copy.lang}`}
        lang={copy.lang}
      />
    </article>
  );
}
