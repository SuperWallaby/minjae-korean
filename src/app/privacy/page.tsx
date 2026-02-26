import { Container } from "@/components/site/Container";

export default function PrivacyPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Last updated: {new Date().getFullYear()}</p>

          <p>
            Your privacy is important to us. This Privacy Policy explains what
            information we collect, how we use it, and what rights you have.
          </p>

          <h2 className="font-medium text-foreground">
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

          <h2 className="font-medium text-foreground">
            How We Use Your Information
          </h2>

          <p>We use your information to:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and operate the service</li>
            <li>Improve lessons and user experience</li>
            <li>Communicate important updates</li>
            <li>Ensure the security of your account</li>
          </ul>

          <h2 className="font-medium text-foreground">Data Sharing</h2>

          <p>We do not sell your personal information.</p>

          <p>
            We may use trusted third-party services (such as hosting,
            authentication, and analytics providers) to operate the service.
            These providers only access data necessary to perform their
            function.
          </p>

          <h2 className="font-medium text-foreground">Your Rights</h2>

          <p>
            You can request access, correction, or deletion of your data at any
            time.
          </p>

          <h2 className="font-medium text-foreground">Contact</h2>

          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
            <br />
            <span className="text-foreground">minjae@kajakorean.com</span>
          </p>

          <p>
            We aim to keep this policy simple, transparent, and respectful of
            your privacy.
          </p>
        </div>
      </Container>
    </section>
  );
}
