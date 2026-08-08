import Image from "next/image";
import Link from "next/link";

import { CoachingComingSoonButton } from "@/components/site/CoachingComingSoonButton";
import { Container } from "@/components/site/Container";
import {
  MarketingHeader,
  marketingStyles,
} from "@/components/site/MarketingShell";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

import styles from "./home-renewal.module.css";

export function AboutMeHomeSection() {
  return (
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
                Through my work, I spent years helping foreigners communicate in
                Korean.
              </p>
              <p className={`${styles.sectionLead} mt-4`}>
                I kept researching how to teach Korean more accessibly — and that
                became{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  Kaja Korean
                </strong>
                .
              </p>
              <p className={`${styles.sectionLead} mt-4`}>
                Stick with me, and I&apos;ll help you level up your Korean.
              </p>
              <p className={`${styles.sectionLead} mt-4`}>
                I also offer{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  1:1 coaching
                </strong>
                — level diagnosis, focused practice, and a clear plan you can
                follow. Prefer marketplace tutors? See the{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  $10 OFF
                </strong>{" "}
                italki offer below (Preply has no discount).
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
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CoachingComingSoonButton variant="primary">
                  Book 1:1 with Minjae
                </CoachingComingSoonButton>
                <Link
                  href="/#find-tutor"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-white px-5 text-sm font-semibold text-[var(--quiz-text)] transition hover:bg-[var(--quiz-surface-muted)]"
                >
                  Find a tutor ($10 OFF)
                </Link>
              </div>
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
  );
}
