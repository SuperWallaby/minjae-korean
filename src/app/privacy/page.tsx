import { Container } from "@/components/site/Container";

export default function PrivacyPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          This page is a placeholder for now. It will explain what data we
          collect (for example, your account details and booking history), why we
          collect it, and how you can request changes or deletion.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We’ll keep this simple and transparent.
        </p>
      </Container>
    </section>
  );
}

