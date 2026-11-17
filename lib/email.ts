// Sends mail through Resend if RESEND_API_KEY is set; otherwise silently skips (never blocks an application).
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
async function send(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY; if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Mr & Miss Kericho <onboarding@resend.dev>", to: [to], subject, html }) });
    return res.ok;
  } catch { return false; /* email must never break the main action */ }
}
export async function notifyApplication(o: { kind: string; name: string; email: string; reference?: string; detail: string }) {
  const org = process.env.ORGANISER_EMAIL;
  await Promise.all([
    org ? send(org, `New ${o.kind} application: ${o.name}`, `<p>${esc(o.name)} applied (${esc(o.detail)}).</p>${o.reference ? `<p>Reference: ${esc(o.reference)}</p>` : ""}<p>Contact: ${esc(o.email)}</p>`) : Promise.resolve(),
    send(o.email, "We received your application – Mr & Miss Kericho 2027",
      `<p>Hello ${esc(o.name)},</p><p>Thank you for applying to Mr &amp; Miss Kericho 2027.${o.reference ? ` Your reference is <b>${esc(o.reference)}</b>.` : ""}</p><p>The organisers will review your application and contact you on WhatsApp.</p>`),
  ]);
}

import { approvalText } from "./messages";
export const sendApprovalEmail = (o: { to: string; name: string; title: string; no: number | null }) =>
  send(o.to, "You are approved – Mr & Miss Kericho 2027", `<p>${esc(approvalText(o))}</p><p>Dwell Events Limited</p>`);
