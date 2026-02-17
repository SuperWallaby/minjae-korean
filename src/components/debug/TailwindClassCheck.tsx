"use client";

import { useEffect } from "react";

const INGEST = "http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604";

function send(data: Record<string, unknown>) {
  fetch(INGEST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "TailwindClassCheck.tsx",
      message: "Tailwind class check",
      data,
      timestamp: Date.now(),
      ...data,
    }),
  }).catch(() => {});
}

export function TailwindClassCheck() {
  useEffect(() => {
    // #region agent log
    const run = async () => {
      let allCss = "";
      const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]"));
      for (const link of links) {
        try {
          const href = link.href;
          if (!href || href.startsWith("blob:")) continue;
          const res = await fetch(href);
          const text = await res.text();
          allCss += text;
        } catch {
          // cross-origin or other
        }
      }
      const hasPt10InCss = /\bpt-10\b|\.pt-10\b/.test(allCss);
      const hasMt12InCss = /\bmt-12\b|\.mt-12\b/.test(allCss);
      const has25rem = allCss.includes("2.5rem");
      const paddingTopSnippet = (() => {
        const i = allCss.indexOf("padding-top");
        if (i === -1) return null;
        return allCss.slice(Math.max(0, i - 40), i + 80);
      })();
      send({
        hypothesisId: "H1",
        runId: "tailwind-check",
        data: {
          hasPt10InCss,
          hasMt12InCss,
          has25remInCss: has25rem,
          paddingTopSnippet,
          stylesheetCount: links.length,
          totalCssLength: allCss.length,
          sampleMatch: allCss.match(/\.[a-z]+-[0-9]+\s*\{/)?.[0] ?? null,
        },
      });

      const el = document.querySelector("[class*='pt-10']");
      const computed = el ? getComputedStyle(el).paddingTop : null;
      send({
        hypothesisId: "H4",
        runId: "tailwind-check",
        data: {
          foundElementWithPt10: !!el,
          computedPaddingTop: computed,
          expectedRem: "2.5rem",
        },
      });
    };
    run();
    // #endregion
  }, []);

  return null;
}
