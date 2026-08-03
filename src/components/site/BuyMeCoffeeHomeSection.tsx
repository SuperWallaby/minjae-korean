import Image from "next/image";
import { Coffee } from "lucide-react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

const BMC_URL = "https://buymeacoffee.com/kajakorean";

export function BuyMeCoffeeHomeSection() {
  return (
    <section className="py-6 sm:py-10">
      <Container>
        <StaggerReveal className="overflow-hidden rounded-4xl border border-[#e6b800]/70 bg-gradient-to-br from-[#ffdd00] via-[#ffd000] to-[#f5b800] shadow-(--shadow-float)">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(160px,220px)_1fr] lg:gap-12 lg:px-14">
            <div className="flex justify-center lg:justify-start">
              <div className="relative grid size-36 place-items-center rounded-[2rem] border border-black/10 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:size-44">
                <Image
                  src="/coffeeee.webp"
                  alt=""
                  width={120}
                  height={150}
                  className="object-contain drop-shadow-sm"
                />
              </div>
            </div>

            <div className="max-w-2xl text-[#1a1400]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1400]/65">
                Optional support
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                If a quiz or chart helped you today, you can say thanks with a coffee
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#1a1400]/78 sm:text-lg">
                These stay free on purpose. One coffee helps fund the next quiz
                or chart — for you, and for the next learner who finds this page.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="md"
                  variant="gradient"
                  className="w-fit px-5"
                >
                  <a
                    href={BMC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Coffee className="size-4" />
                    Buy me a coffee
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </StaggerReveal>
      </Container>
    </section>
  );
}
