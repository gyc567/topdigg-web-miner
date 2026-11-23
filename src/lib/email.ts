/**
 * Transactional email.
 *
 * Provider-agnostic on purpose: Resend is a plain HTTPS API, so it needs no
 * SDK. Swap the transport by changing sendEmail() — nothing else touches it.
 *
 *   RESEND_API_KEY + EMAIL_FROM set → real delivery via Resend
 *   neither set                    → dev mode: the message is logged and
 *                                     written to .dev-emails/ so the flow can
 *                                     be exercised locally end to end.
 */
import fs from "node:fs";
import path from "node:path";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailResult = { delivered: boolean; provider: "resend" | "dev"; error?: string };

const DEV_EMAIL_DIR = path.join(process.cwd(), ".dev-emails");

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    // Dev mode — no provider configured. Persist so tests (and humans) can
    // read the verification / reset link out of the file.
    try {
      fs.mkdirSync(DEV_EMAIL_DIR, { recursive: true });
      const file = path.join(DEV_EMAIL_DIR, `${Date.now()}-${msg.to.replace(/[^\w.@-]/g, "_")}.txt`);
      fs.writeFileSync(
        file,
        `To: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n`,
        "utf-8"
      );
      console.log(`[email:dev] to=${msg.to} subject=${msg.subject} → ${file}`);
    } catch (err: any) {
      console.error("[email:dev] failed to persist message:", err?.message ?? err);
    }
    return { delivered: false, provider: "dev" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        ...(msg.html ? { html: msg.html } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] resend ${res.status}: ${detail.slice(0, 200)}`);
      return { delivered: false, provider: "resend", error: `resend ${res.status}` };
    }
    return { delivered: true, provider: "resend" };
  } catch (err: any) {
    console.error("[email] send failed:", err?.message ?? err);
    return { delivered: false, provider: "resend", error: err?.message };
  }
}
