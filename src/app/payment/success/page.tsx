import { PaymentSuccessGeneric, PaymentSuccessView } from "@/components/payment/PaymentSuccessView";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id.trim() : "";

  if (!sessionId) {
    return <PaymentSuccessGeneric />;
  }

  return <PaymentSuccessView sessionId={sessionId} />;
}
