import Link from "next/link";
import { Suspense } from "react";

import { BlogInnerPage } from "@/components/site/BlogInnerPage";
import homeStyles from "@/components/site/home-blog.module.css";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

export default function PaymentCancelPage() {
  return (
    <BlogInnerPage containerClassName="max-w-2xl">
      <h1 className={homeStyles.sectionTitle}>Payment cancelled</h1>
      <p className={homeStyles.sectionBody}>
        No worries—nothing was charged. You can try again anytime.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Suspense fallback={<Button disabled>Try again</Button>}>
          <CheckoutButton product="single">Try again</CheckoutButton>
        </Suspense>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </BlogInnerPage>
  );
}
