import type { Metadata } from "next";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { siteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for What is this in Korean and the Korean Quiz app.",
  alternates: { canonical: siteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader title="Privacy Policy" />

          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--quiz-text-sub)]">
            <p>Last updated: {new Date().getFullYear()}</p>

            <p>
              Your privacy is important to us. This Privacy Policy explains what
              information we collect, how we use it, and what rights you have.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">
              Information We Collect
            </h2>

            <p>
              We may collect basic account information such as your email address,
              name, and profile details when you create an account.
            </p>

            <p>
              We also collect usage data, such as how you interact with lessons,
              videos, and features, to improve the learning experience.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">
              Quiz App Data
            </h2>

            <p>
              The What is this in Korean quiz app does not require an account.
              It may use a random device identifier and quiz activity to serve
              questions, remember difficulty preferences, and improve learning
              progress. Favorites and history may also be stored locally on
              your device.
            </p>

            <p>
              If you enable study reminders, we may store a push notification
              token solely to deliver those reminders. You can disable
              notifications in your device settings.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">
              How We Use Your Information
            </h2>

            <p>We use your information to:</p>

            <ul className="list-disc space-y-1 pl-5">
              <li>Provide and operate the service</li>
              <li>Improve lessons and user experience</li>
              <li>Communicate important updates</li>
              <li>Ensure the security of your account</li>
            </ul>

            <h2 className="font-medium text-[var(--quiz-text)]">Data Sharing</h2>

            <p>We do not sell your personal information.</p>

            <p>
              We may use trusted third-party services (such as hosting,
              authentication, and analytics providers) to operate the service.
              These providers only access data necessary to perform their
              function.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Your Rights</h2>

            <p>
              You can request access, correction, or deletion of your data at any
              time.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">Contact</h2>

            <p>
              If you have any questions about this Privacy Policy, please contact
              us at:
              <br />
              <span className="text-[var(--quiz-text)]">support@trbox.co.kr</span>
            </p>

            <p>
              We aim to keep this policy simple, transparent, and respectful of
              your privacy.
            </p>
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
