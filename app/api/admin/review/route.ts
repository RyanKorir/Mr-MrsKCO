import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const s = await requireStaff(req);
  if (!s) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const { id, action, table } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !["approve", "reject", "review"].includes(action)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (table === "fashion_week") {
    const status = { approve: "approved", reject: "rejected", review: "under_review" }[action as string]!;
    const { error } = await s.db.from("fashion_week_applications").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    await s.db.from("audit_logs").insert({ actor: s.id, action: "fashion_week_" + action, detail: { id } });
    return NextResponse.json({ status });
  }
  const { data, error } = await s.db.rpc("review_contestant", { p_id: id, p_action: action, p_actor: s.id });
  if (error) return NextResponse.json({ error: error.message.includes("guardian_consent_missing") ? "Guardian consent is missing for this minor." : "Update failed" }, { status: 400 });
  return NextResponse.json(data);
}
