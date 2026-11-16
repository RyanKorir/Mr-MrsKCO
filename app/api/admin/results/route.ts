import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-auth";
import { buildResults } from "@/lib/results";
export const dynamic = "force-dynamic";
const ROLES = ["super_admin", "voting_manager"];

export async function GET(req: Request) {
  const s = await requireStaff(req, ROLES);
  if (!s) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  return NextResponse.json(await buildResults(s.db, false));
}
export async function POST(req: Request) {
  const s = await requireStaff(req, ROLES);
  if (!s) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const { divisionId, published } = await req.json().catch(() => ({}));
  if (typeof divisionId !== "number" || typeof published !== "boolean") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { error } = await s.db.from("divisions").update({ results_published: published }).eq("id", divisionId);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  await s.db.from("audit_logs").insert({ actor: s.id, action: published ? "results_published" : "results_unpublished", detail: { divisionId } });
  return NextResponse.json({ ok: true });
}
