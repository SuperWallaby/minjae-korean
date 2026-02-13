import { Suspense } from "react";

import { LoginClient } from "@/app/login/LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}

