import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppStoreBadges } from "@/components/site/AppStoreBadges";
import { Container } from "@/components/site/Container";
import { VocabQuizInteractiveStack } from "@/components/site/VocabQuizInteractiveStack";
import { Button } from "@/components/ui/Button";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import type { KoreanQuizHomeCard } from "@/lib/koreanQuiz/store";

import styles from "./vocab-quiz-home.module.css";

type Props = {
  cards: KoreanQuizHomeCard[];
};

export function VocabQuizHomeSection({ cards }: Props) {
  return (
    <section className="pt-12 sm:pt-18">
      <Container>
        <StaggerReveal className={styles.heroShell}>
          <div className={styles.heroTopBar}>
            <Button
              asChild
              size="sm"
              variant="light"
              className="shrink-0 px-4 text-sm shadow-sm"
            >
              <Link href="/vocab-quiz">
                Play in browser <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className={styles.heroGrid}>
            <StaggerReveal as="div" className={styles.stackCol} delayMs={80}>
              <VocabQuizInteractiveStack cards={cards} hero />
            </StaggerReveal>

            <div className={styles.copyCol}>
              <div className={styles.heroEyebrow}>Free app</div>
              <h1 className={styles.heroTitle}>What is this in Korean?</h1>
              <p className={styles.heroLead}>
                The best app for learning Korean vocabulary.
              </p>

              <div className="mt-8">
                <p className={styles.heroStoreLabel}>Get the app</p>
                <AppStoreBadges className="mt-3" theme="dark" size="lg" />
              </div>
            </div>
          </div>
        </StaggerReveal>
      </Container>
    </section>
  );
}
