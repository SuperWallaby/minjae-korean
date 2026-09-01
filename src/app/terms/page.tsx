import type { Metadata } from "next";

import { BlogInnerPage } from "@/components/site/BlogInnerPage";
import homeStyles from "@/components/site/home-blog.module.css";
import { siteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Kaja Korean.",
  alternates: { canonical: siteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <BlogInnerPage containerClassName="max-w-3xl">
          <h1 className={homeStyles.sectionTitle}>Terms of Service</h1>

          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--quiz-text-sub)]">
            <p>Last updated: {new Date().getFullYear()}</p>

            <p>
              By using Kaja Korean, you agree to these Terms of Service. Please read
              them carefully.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">
              Use of the Service
            </h2>

            <p>
              Kaja Korean provides Korean learning content and related features. You
              agree to use the service only for lawful purposes and in a
              respectful manner.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Accounts</h2>

            <p>
              When you create an account, you are responsible for keeping your
              login information secure and for all activity under your account.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Payments</h2>

            <p>
              Some features may require payment. All payments are handled securely
              through third-party payment providers.
            </p>

            <p>Payments are generally non-refundable unless required by law.</p>

            <h2 className="font-medium text-[var(--quiz-text)]">Content</h2>

            <p>
              All videos and materials provided by Kaja Korean are protected by copyright
              and are for personal use only.
            </p>

            <p>
              You may not copy, redistribute, or resell content without
              permission.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Termination</h2>

            <p>We may suspend or terminate access if these terms are violated.</p>

            <h2 className="font-medium text-[var(--quiz-text)]">Disclaimer</h2>

            <p>
              The service is provided “as is” without guarantees of specific
              results.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Changes</h2>

            <p>
              We may update these terms from time to time. Continued use means you
              accept the updated terms.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Contact</h2>

            <p>
              If you have any questions, please contact:
              <br />
              <span className="text-[var(--quiz-text)]">minjae@kajakorean.com</span>
            </p>
          </div>
    </BlogInnerPage>
  );
}
