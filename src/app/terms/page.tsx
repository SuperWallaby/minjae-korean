import { Container } from "@/components/site/Container";

export default function TermsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Last updated: {new Date().getFullYear()}</p>

          <p>
            By using Kaja, you agree to these Terms of Service. Please read them
            carefully.
          </p>

          <h2 className="font-medium text-foreground">Use of the Service</h2>

          <p>
            Kaja provides Korean language learning content and related features.
            You agree to use the service only for lawful purposes and in a
            respectful manner.
          </p>

          <h2 className="font-medium text-foreground">Accounts</h2>

          <p>
            When you create an account, you are responsible for keeping your
            login information secure and for all activity under your account.
          </p>

          <h2 className="font-medium text-foreground">Payments</h2>

          <p>
            Some features may require payment. All payments are handled securely
            through third-party payment providers.
          </p>

          <p>Payments are generally non-refundable unless required by law.</p>

          <h2 className="font-medium text-foreground">Content</h2>

          <p>
            All lessons, videos, and materials provided by Kaja are protected by
            copyright and are for personal use only.
          </p>

          <p>
            You may not copy, redistribute, or resell content without
            permission.
          </p>

          <h2 className="font-medium text-foreground">Termination</h2>

          <p>We may suspend or terminate access if these terms are violated.</p>

          <h2 className="font-medium text-foreground">Disclaimer</h2>

          <p>
            The service is provided “as is” without guarantees of specific
            results.
          </p>

          <h2 className="font-medium text-foreground">Changes</h2>

          <p>
            We may update these terms from time to time. Continued use means you
            accept the updated terms.
          </p>

          <h2 className="font-medium text-foreground">Contact</h2>

          <p>
            If you have any questions, please contact:
            <br />
            <span className="text-foreground">minjae@kajakorean.com</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
