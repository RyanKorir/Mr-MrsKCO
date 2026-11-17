import { approvalText } from "./messages";
// Sends mail via Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) or Resend (RESEND_API_KEY). With neither set it silently skips,
// so email problems never block registration or approvals. Replies always go to the event's inbox.
const REPLY_TO = process.env.EMAIL_REPLY_TO || "mrandmisskericho@gmail.com";
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!to) return false;
  const gUser = process.env.GMAIL_USER, gPass = process.env.GMAIL_APP_PASSWORD;
  try {
    if (gUser && gPass) {
      // @ts-ignore – nodemailer is loaded only when Gmail sending is configured
      const nodemailer: any = (await import("nodemailer")).default;
      await nodemailer.createTransport({ service: "gmail", auth: { user: gUser, pass: gPass } })
        .sendMail({ from: `Mr & Miss Kericho <${gUser}>`, to, replyTo: REPLY_TO, subject, html });
      return true;
    }
    const key = process.env.RESEND_API_KEY; if (!key) return false;
    const res = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Mr & Miss Kericho <onboarding@resend.dev>", reply_to: REPLY_TO, to: [to], subject, html }) });
    return res.ok;
  } catch (e: any) { console.error("email_failed", e?.code ?? "", e?.message ?? ""); return false; }
}
export async function notifyApplication(o: { kind: string; name: string; email: string; reference?: string; detail: string }) {
  const org = process.env.ORGANISER_EMAIL;
  await Promise.all([
    org ? send(org, `New ${o.kind} application: ${o.name}`, `<p>${esc(o.name)} applied (${esc(o.detail)}).</p>${o.reference ? `<p>Registration number: ${esc(o.reference)}</p>` : ""}<p>Contact: ${esc(o.email)}</p>`) : Promise.resolve(false),
    send(o.email, "We received your application – Mr & Miss Kericho 2027",
      `<p>Hello ${esc(o.name)},</p><p>Thank you for applying to Mr &amp; Miss Kericho 2027.${o.reference ? ` Your registration number is <b>${esc(o.reference)}</b>.` : ""}</p><p>The organisers will review your application and contact you on WhatsApp.</p>`),
  ]);
}
export const sendApprovalEmail = (o: { to: string; name: string; title: string; no: number | null }) =>
  send(o.to, "You are approved – Mr & Miss Kericho 2027", `<p>${esc(approvalText(o))}</p><p>Dwell Events Limited</p>`);
