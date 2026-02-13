import { Container } from "@/components/site/Container";

export default function TermsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          This page is a placeholder for now. It will outline the rules and
          expectations for using Kaja (accounts, bookings, payments, and
          acceptable use).
        </p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          If you have questions, please reach out and we’ll help.
        </p>
      </Container>
    </section>
  );
}

