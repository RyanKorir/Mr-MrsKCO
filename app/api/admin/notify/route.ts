import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-auth";
import { sendApprovalEmail } from "@/lib/email";

export async function POST(req: Request) {
  const s = await requireStaff(req);
  if (!s) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { data: c } = await s.db.from("contestants").select("email, full_name, stage_name, contestant_no, status, divisions(title)").eq("id", id).single();
  if (!c || c.status !== "approved") return NextResponse.json({ error: "Only approved contestants can be emailed." }, { status: 400 });
  const ok = await sendApprovalEmail({ to: c.email, name: c.stage_name || c.full_name.split(" ")[0], title: (c as any).divisions?.title, no: c.contestant_no });
  if (!ok) return NextResponse.json({ error: "The email could not be sent. The email settings may need checking." }, { status: 502 });
  await s.db.from("audit_logs").insert({ actor: s.id, action: "approval_email_sent", detail: { contestant: id } });
  return NextResponse.json({ ok: true, to: c.email });
}
