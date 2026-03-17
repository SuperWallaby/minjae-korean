import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { ExamEditClient } from "../../_components/ExamEditClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PlacementExamEditPage() {
  if (process.env.NODE_ENV === "production") return notFound();

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <Link href="/exams/placement" className="hover:text-foreground">
            Check my level
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
          Edit: Check my level
        </h1>
        <div className="mt-6">
          <ExamEditClient
            slug="placement"
            title="Check my level"
            backHref="/exams/placement"
          />
        </div>
      </Container>
    </div>
  );
}
