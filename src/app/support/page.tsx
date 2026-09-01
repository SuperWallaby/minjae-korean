import type { Metadata } from "next";
import Link from "next/link";

import { BlogInnerPage } from "@/components/site/BlogInnerPage";
import homeStyles from "@/components/site/home-blog.module.css";
import { Button } from "@/components/ui/Button";
import { siteUrl } from "@/lib/siteUrl";

const SUPPORT_URL = siteUrl("/support");

export const metadata: Metadata = {
  title: { absolute: "Support | Kaja Korean" },
  description: "Get help with the Kaja Korean quiz app.",
  alternates: { canonical: SUPPORT_URL },
  openGraph: {
    type: "website",
    title: "Support | Kaja Korean",
    description: "Get help with quizzes, audio, and your learning history.",
    url: SUPPORT_URL,
  },
};

export default function SupportPage() {
  return (
    <BlogInnerPage containerClassName="max-w-3xl">
      <p className={homeStyles.sectionLabel}>Support</p>
      <h1 className={homeStyles.sectionTitle}>Korean Quiz App</h1>
      <p className={homeStyles.sectionBody}>
        Need help with quizzes, audio, or your learning history? We’re here to help.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold tracking-tight">
          Contact
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Email us at{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href="mailto:support@trbox.co.kr"
          >
            support@trbox.co.kr
          </a>
          . We usually reply within a few business days.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold tracking-tight">
          Common questions
        </h2>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">No sound?</strong> Check
            your device volume and silent mode. Tap the speaker icon on a
            choice to replay pronunciation.
          </li>
          <li>
            <strong className="text-foreground">
              Quizzes not loading?
            </strong>{" "}
            Make sure you’re online. The app needs an internet connection
            to fetch new questions.
          </li>
          <li>
            <strong className="text-foreground">
              History or favorites missing?
            </strong>{" "}
            Progress is stored on your device. Reinstalling the app may
            reset local data.
          </li>
        </ul>
      </section>

      <div className="mt-10">
        <Button asChild variant="outline">
          <Link href="/vocab-quiz">Open the vocab quiz</Link>
        </Button>
      </div>
    </BlogInnerPage>
  );
}
