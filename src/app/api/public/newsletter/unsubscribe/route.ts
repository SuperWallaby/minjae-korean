import { NextRequest } from "next/server";

import { unsubscribeNewsletterSubscriber } from "@/lib/newsletterSubscribersRepo";
import { verifyNewsletterUnsubscribeToken } from "@/lib/newsletterUnsubscribe";

export const runtime = "nodejs";

function page(title: string, body: string) {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#fafafa; color:#1d1d1f; margin:0; }
    main { max-width: 480px; margin: 48px auto; padding: 24px; background:#fff; border:1px solid #e5e5ea; border-radius: 18px; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { margin: 0 0 12px; line-height: 1.55; color: #424245; }
    a { color: #0071e3; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${body}
  </main>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
  const token = (req.nextUrl.searchParams.get("token") ?? "").trim();

  if (!email || !token) {
    return page(
      "Unsubscribe",
      "<p>Invalid unsubscribe link.</p><p><a href='/'>Back to Kaja</a></p>",
    );
  }

  if (!verifyNewsletterUnsubscribeToken(email, token)) {
    return page(
      "Unsubscribe",
      "<p>This unsubscribe link is invalid or expired.</p><p><a href='/'>Back to Kaja</a></p>",
    );
  }

  await unsubscribeNewsletterSubscriber(email);

  const safeEmail = email
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return page(
    "You're unsubscribed",
    `<p><strong>${safeEmail}</strong> will no longer receive weekly Korean quiz emails from Kaja.</p>
     <p>You can subscribe again anytime from our <a href='/subscribe'>Get Free Book</a> page.</p>
     <p><a href='/'>Back to Kaja</a></p>`,
  );
}
