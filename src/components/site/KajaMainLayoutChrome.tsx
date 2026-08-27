"use client";

import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import NextTopLoader from "nextjs-toploader";
import { MockSessionProvider } from "@/lib/mock/MockSessionProvider";
import { EducationModeProvider } from "@/lib/EducationModeProvider";

const TeachingSpotlight = dynamic(
  () =>
    import("@/components/site/TeachingSpotlight").then((m) => ({
      default: m.TeachingSpotlight,
    })),
  { ssr: false },
);
const TeachingCmdDraw = dynamic(
  () =>
    import("@/components/site/MouseDraw").then((m) => ({
      default: m.TeachingCmdDraw,
    })),
  { ssr: false },
);
const SeoMiniQuizWidget = dynamic(
  () =>
    import("@/components/site/SeoMiniQuizWidget").then((m) => ({
      default: m.SeoMiniQuizWidget,
    })),
  { ssr: false },
);
const ItalkiTutorStickyRail = dynamic(
  () =>
    import("@/components/site/ItalkiTutorStickyRail").then((m) => ({
      default: m.ItalkiTutorStickyRail,
    })),
  { ssr: false },
);
const QuickNote = dynamic(
  () =>
    import("@/components/QuickNote").then((m) => ({ default: m.QuickNote })),
  { ssr: false },
);

export function KajaMainLayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MockSessionProvider>
      <EducationModeProvider>
        <div className="min-h-dvh bg-background">
          <NextTopLoader
            color="#0071e3"
            height={3}
            showSpinner={false}
            crawlSpeed={200}
            speed={200}
          />
          <ScrollToTop />
          <TeachingSpotlight />
          <TeachingCmdDraw />
          <SiteNavbar />
          <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
          <SiteFooter />
          <SeoMiniQuizWidget />
          <ItalkiTutorStickyRail />
          <QuickNote />
        </div>
      </EducationModeProvider>
    </MockSessionProvider>
  );
}
