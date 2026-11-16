import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase-server";
import { notifyApplication } from "@/lib/email";
import { validateLocation } from "@/lib/kericho";
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) ?? "").trim();
  const [kind, fullName, email, phone] = [g("kind"), g("fullName"), g("email"), g("phone")];
  if (!["designer", "fashionista"].includes(kind) || !fullName || !email || !phone) return fail("Please fill in all required fields.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (!/^(\+?254|0)\d{9}$/.test(phone.replace(/\s/g, ""))) return fail("Enter a valid Kenyan phone number.");
  if (g("rules") !== "yes") return fail("You must accept the event rules and privacy notice.");

  const loc = validateLocation(g("constituency"), g("ward"));
  if (!loc) return fail("Choose your constituency and ward.");
  const db = adminClient();
  let photo_path: string | null = null;
  const photo = f.get("photo");
  if (photo instanceof Blob && photo.size > 0) {
    if (photo.size > 5_000_000) return fail("Photo must be under 5 MB.");
    photo_path = `fw-${crypto.randomUUID()}.jpg`;
    const up = await db.storage.from("contestant-photos").upload(photo_path, photo, { contentType: "image/jpeg" });
    if (up.error) return fail("Photo upload failed. Please try again.", 500);
  }
  const links = g("links").split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const { error } = await db.from("fashion_week_applications").insert({
    kind, full_name: fullName, email, phone, constituency: loc.constituency, ward: loc.ward, bio: g("bio") || null, links, photo_path });
  if (error) return fail("Could not save your application. Please try again.", 500);
  await notifyApplication({ kind: "Fashion Week " + kind, name: fullName, email, detail: kind });
  return NextResponse.json({ ok: true });
}
