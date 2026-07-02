import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import type { ArticleFeedItem } from "@/components/article/ArticleFeed";
import { Container } from "@/components/site/Container";
import {
  MarketingHeader,
  MarketingShellBody,
  marketingStyles,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

import styles from "./home-renewal.module.css";

type Props = {
  news: ArticleFeedItem[];
  blog: ArticleFeedItem[];
};

/** Sections 3–5 on the home page (About, News, Blog). 1:1 coaching blocks hidden while sessions are paused. */
export function HomeRenewalSections({ news, blog }: Props) {
  return (
    <>
      {/* 3) Author */}
      <RevealOnScroll
        as="section"
        id="approach"
        className={`scroll-mt-24 ${styles.sectionBlock}`}
      >
        <Container>
          <StaggerReveal className={styles.sectionShell}>
            <div
              className={`${styles.sectionShellPad} grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center`}
            >
              <div className="max-w-2xl">
                <MarketingHeader
                  eyebrow="About me"
                  title="Hi there!"
                  titleAs="h2"
                />
                <p className={`${styles.sectionLead} mt-4`}>
                  I&apos;m a{" "}
                  <strong className="font-semibold text-[var(--quiz-text)]">
                    professional Korean teacher
                  </strong>
                  — and a former programmer.
                </p>
                <p className={`${styles.sectionLead} mt-4`}>
                  Through my work, I spent years helping foreigners communicate
                  in Korean.
                </p>
                <p className={`${styles.sectionLead} mt-4`}>
                  I kept researching how to teach Korean more accessibly — and
                  that became{" "}
                  <strong className="font-semibold text-[var(--quiz-text)]">
                    Kaja Korean
                  </strong>
                  .
                </p>
                <p className={`${styles.sectionLead} mt-4`}>
                  Stick with me, and I&apos;ll help you level up your Korean.
                </p>
                <p className={`${styles.sectionLead} mt-4`}>
                  You can find me on{" "}
                  <Link
                    href="https://instagram.com/kaja_minjae"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--quiz-primary)] underline underline-offset-2 hover:no-underline"
                  >
                    Instagram
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="https://www.tiktok.com/@kajakorean"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--quiz-primary)] underline underline-offset-2 hover:no-underline"
                  >
                    TikTok
                  </Link>
                  , where I teach Korean in live sessions.
                </p>
              </div>

              <StaggerReveal
                className="flex justify-center lg:justify-end"
                delayMs={90}
              >
                <div
                  className={`${marketingStyles.portraitRing} relative size-[280px] sm:size-[340px]`}
                >
                  <Image
                    src="/placeholders/minjae-hero.webp"
                    alt="Portrait of Minjae"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </StaggerReveal>
            </div>
          </StaggerReveal>
        </Container>
      </RevealOnScroll>

      {/* 4) News */}
      <RevealOnScroll as="section" className={styles.sectionBlock}>
        <Container>
          <StaggerReveal className={styles.sectionShell}>
            <MarketingShellBody>
              <MarketingHeader
                eyebrow="Practice"
                title="Kaja News — readings & listening"
                titleAs="h2"
                action={
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="inline-flex shrink-0 items-center gap-2 border-[var(--quiz-border)]"
                  >
                    <Link href="/news">
                      More articles <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                }
              />

              {news.length > 0 ? (
                <StaggerReveal
                  as="div"
                  className="mt-8"
                  staggerMs={90}
                  delayMs={80}
                >
                  <ArticleFeed articles={news} showMajor={false} />
                </StaggerReveal>
              ) : null}
            </MarketingShellBody>
          </StaggerReveal>
        </Container>
      </RevealOnScroll>

      {/* 5) Blog */}
      <RevealOnScroll as="section" className={`${styles.sectionBlock} pb-16`}>
        <Container>
          <StaggerReveal className={styles.sectionShell}>
            <MarketingShellBody>
              <MarketingHeader
                eyebrow="Blog"
                title="Notes on learning Korean"
                titleAs="h2"
                action={
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="inline-flex shrink-0 items-center gap-2 border-[var(--quiz-border)]"
                  >
                    <Link href="/blog">
                      More posts <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                }
              />

              {blog.length > 0 ? (
                <StaggerReveal
                  as="div"
                  className="mt-8"
                  staggerMs={90}
                  delayMs={80}
                >
                  <ArticleFeed
                    articles={blog}
                    basePath="/blog/article"
                    showMajor
                  />
                </StaggerReveal>
              ) : null}
            </MarketingShellBody>
          </StaggerReveal>
        </Container>
      </RevealOnScroll>
    </>
  );
}
