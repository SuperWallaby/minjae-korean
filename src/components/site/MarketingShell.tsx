import * as React from "react";

import { Container } from "@/components/site/Container";
import { cn } from "@/lib/utils";

import styles from "./home-renewal.module.css";

type MarketingPageProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  as?: "div" | "section";
};

/** Outer page wrapper: section spacing + Container. */
export function MarketingPage({
  children,
  className,
  containerClassName,
  id,
  as: Tag = "div",
}: MarketingPageProps) {
  return (
    <Tag
      id={id}
      className={cn(styles.sectionBlock, "pb-16 pt-6 sm:pt-10", className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}

type MarketingShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** White rounded card shell. */
export function MarketingShell({ children, className }: MarketingShellProps) {
  return (
    <div className={cn(styles.sectionShell, className)}>{children}</div>
  );
}

type MarketingShellBodyProps = {
  children: React.ReactNode;
  className?: string;
};

/** Padded interior of MarketingShell. */
export function MarketingShellBody({
  children,
  className,
}: MarketingShellBodyProps) {
  return (
    <div className={cn(styles.sectionShellPad, className)}>{children}</div>
  );
}

type MarketingHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  titleAs?: "h1" | "h2";
  action?: React.ReactNode;
  className?: string;
  centered?: boolean;
};

/** Eyebrow + title + optional lead; optional trailing action row. */
export function MarketingHeader({
  eyebrow,
  title,
  lead,
  titleAs: TitleTag = "h1",
  action,
  className,
  centered,
}: MarketingHeaderProps) {
  const header = (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <TitleTag className={styles.sectionTitle}>{title}</TitleTag>
      {lead ? (
        <p
          className={cn(
            styles.sectionLead,
            "mt-4",
            centered && "mx-auto max-w-lg",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );

  if (!action) return header;

  return (
    <div className="flex w-full flex-wrap items-end justify-between gap-4">
      {header}
      {action}
    </div>
  );
}

export { styles as marketingStyles };
