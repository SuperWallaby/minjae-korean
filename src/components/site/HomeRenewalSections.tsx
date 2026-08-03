import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import type { ArticleFeedItem } from "@/components/article/ArticleFeed";
import { Container } from "@/components/site/Container";
import {
  MarketingHeader,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

import styles from "./home-renewal.module.css";

type Props = {
  news: ArticleFeedItem[];
  blog: ArticleFeedItem[];
};

/** News + Blog sections on the home page. */
export function HomeRenewalSections({ news, blog }: Props) {
  return (
    <>
      <RevealOnScroll as="section" className={styles.sectionBlock}>
        <Container>
          <StaggerReveal className={styles.sectionShell}>
            <MarketingShellBody>
              <MarketingHeader
                eyebrow="Practice"
                title="News — readings & listening"
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
