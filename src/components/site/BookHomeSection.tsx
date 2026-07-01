import Link from "next/link";

import { BookHeroClickable } from "@/components/site/BookHeroClickable";
import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

export function BookHomeSection() {
  return (
    <section className="py-10 sm:py-16">
      <Container className="relative">
        <StaggerReveal className="overflow-hidden rounded-4xl border border-black/8 bg-[#f25b43] shadow-(--shadow-float)">
          <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(260px,420px)_1fr] lg:items-center lg:px-14">
            <div className="flex justify-center lg:justify-start">
              <BookHeroClickable />
            </div>

            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center rounded-full border border-white/18 bg-white/12 px-4 py-2 font-serif text-sm font-semibold tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                <span className="mr-1 mt-0.5 inline-block text-lg">🥳</span> New
                Book
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                Korean, Beyond Translation
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/82 sm:text-lg">
                <strong className="font-semibold text-white">100 words</strong>{" "}
                that teach the Korean people actually use. Learn the{" "}
                <strong className="font-semibold text-white">nuance</strong>{" "}
                behind direct translation and build a more natural feel for{" "}
                <strong className="font-semibold text-white">
                  real conversation
                </strong>
                .
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="md"
                  variant="light"
                  className="w-fit px-5"
                >
                  <Link href="/book/korean-beyond-translation">
                    Read sample content
                  </Link>
                </Button>
                <Button
                  asChild
                  size="md"
                  variant="outline"
                  className="w-fit border-white/45 bg-white/8 px-5 text-white hover:bg-white/14"
                >
                  <Link href="/book/korean-beyond-translation">
                    Buy for $9.90
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </StaggerReveal>
      </Container>
    </section>
  );
}
