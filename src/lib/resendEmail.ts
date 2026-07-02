function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = mustEnv("RESEND_API_KEY");
  const from = mustEnv("RESEND_FROM_EMAIL");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (json && typeof json === "object" && "message" in json
        ? String((json as { message?: unknown }).message ?? "")
        : null) ?? `HTTP ${res.status}`;
    throw new Error(`Resend failed: ${msg}`);
  }
}
