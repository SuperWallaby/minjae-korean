import { redirect } from "next/navigation";

/** Stripe / links sometimes use a locale prefix; canonical route is /payment/success. */
export default async function EnPaymentSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.session_id;
  const sessionId = typeof raw === "string" ? raw.trim() : "";
  if (sessionId) {
    redirect(
      `/payment/success?session_id=${encodeURIComponent(sessionId)}`,
    );
  }
  redirect("/payment/success");
}
