import Link from "next/link";

import { AffiliateTutorBanner } from "@/components/site/ItalkiTutorBanner";
import { Container } from "@/components/site/Container";
import { MarketingHeader } from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

import styles from "./home-renewal.module.css";

export function FindTutorHomeSection() {
  return (
    <RevealOnScroll
      as="section"
      id="find-tutor"
      className={`scroll-mt-24 ${styles.sectionBlock}`}
    >
      <Container>
        <StaggerReveal className={styles.sectionShell}>
          <div
            className={`${styles.sectionShellPad} grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}
          >
            <div className="max-w-2xl">
              <MarketingHeader
                eyebrow="1:1 Korean"
                title="Find a Korean tutor"
                titleAs="h2"
              />
              <p className={`${styles.sectionLead} mt-4`}>
                Want real conversation practice? Book{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  1:1 lessons with me
                </strong>
                , or browse marketplace tutors — including offers like{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  $10 OFF
                </strong>{" "}
                when available.
              </p>
              <p className={`${styles.sectionLead} mt-4`}>
                Start with a short diagnosis, or jump into a focused session.
                Free quizzes and charts stay free either way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="md" variant="gradient" className="w-fit px-5">
                  <Link href="/coaching">Study 1:1 with Minjae</Link>
                </Button>
                <Button
                  asChild
                  size="md"
                  variant="outline"
                  className="w-fit px-5"
                >
                  <Link href="/coaching">See coaching options</Link>
                </Button>
              </div>
            </div>

            <StaggerReveal
              className="flex w-full justify-center lg:justify-end"
              delayMs={80}
            >
              <AffiliateTutorBanner variant="square" />
            </StaggerReveal>
          </div>
        </StaggerReveal>
      </Container>
    </RevealOnScroll>
  );
}
