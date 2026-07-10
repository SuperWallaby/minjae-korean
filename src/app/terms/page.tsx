import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader title="Terms of Service" />

          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--quiz-text-sub)]">
            <p>Last updated: {new Date().getFullYear()}</p>

            <p>
              By using What is this in Korean, you agree to these Terms of Service. Please read
              them carefully.
            </p>

            <h2 className="font-medium text-[var(--quiz-text)]">
              Use of the Service
            </h2>

            <p>
              What is this in Korean provides Korean learning content and related features. You
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
              All videos and materials provided by What is this in Korean are protected by copyright
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
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
