import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await requireStaff(req);
  if (!s) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const { data, error } = await s.db.from("contestants")
    .select("id, full_name, stage_name, email, whatsapp, date_of_birth, town, bio, talent, photo_path, is_minor, guardian_name, guardian_phone, guardian_consent, status, contestant_no, referral_code, is_test, created_at, divisions(title)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load applications" }, { status: 500 });
  const paths = (data ?? []).map((c) => c.photo_path);
  const { data: signed } = await s.db.storage.from("contestant-photos").createSignedUrls(paths, 3600);
  const url = Object.fromEntries((signed ?? []).map((x) => [x.path, x.signedUrl]));
  const { data: fw } = await s.db.from("fashion_week_applications").select("id, kind, full_name, email, phone, location, bio, links, status, created_at").order("created_at", { ascending: false });
  return NextResponse.json({ contestants: (data ?? []).map((c) => ({ ...c, photo: url[c.photo_path] ?? null })), fashionWeek: fw ?? [] });
}
