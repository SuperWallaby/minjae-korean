"use client";

import * as React from "react";

import { AffiliateTutorBanner } from "@/components/site/ItalkiTutorBanner";
import { CoachingComingSoonButton } from "@/components/site/CoachingComingSoonButton";
import { Container } from "@/components/site/Container";
import { MarketingHeader } from "@/components/site/MarketingShell";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import { ITALKI_AFFILIATE_URL } from "@/lib/affiliateTutor";
import { trackAffiliateClick } from "@/lib/ga";

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
                , or find a marketplace tutor on italki with{" "}
                <strong className="font-semibold text-[var(--quiz-text)]">
                  $10 OFF
                </strong>
                . Preply has no discount on this link.
              </p>
              <p className={`${styles.sectionLead} mt-4`}>
                Free quizzes and charts stay free either way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CoachingComingSoonButton>
                  Study 1:1 with Minjae
                </CoachingComingSoonButton>
                <a
                  href={ITALKI_AFFILIATE_URL}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() =>
                    trackAffiliateClick({
                      partner: "italki",
                      placement: "home_section",
                    })
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-white px-5 text-sm font-semibold text-[var(--quiz-text)] transition hover:bg-[var(--quiz-surface-muted)]"
                >
                  Find a tutor · $10 OFF
                </a>
              </div>
            </div>

            <StaggerReveal
              className="flex w-full justify-center lg:justify-end"
              delayMs={80}
            >
              {/* Home section always shows italki $10 OFF creative */}
              <AffiliateTutorBanner
                variant="square"
                partner="italki"
                placement="home_section_banner"
              />
            </StaggerReveal>
          </div>
        </StaggerReveal>
      </Container>
    </RevealOnScroll>
  );
}
