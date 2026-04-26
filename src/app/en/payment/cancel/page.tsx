import { redirect } from "next/navigation";

export default function EnPaymentCancelRedirect() {
  redirect("/payment/cancel");
}
