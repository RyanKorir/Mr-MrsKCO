import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase-server";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const ageOn = (dob: Date, now = new Date()) => { let a = now.getFullYear() - dob.getFullYear(); const m = now.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--; return a; };

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) ?? "").trim();
  const photo = f.get("photo");
  const [slug, fullName, email, whatsapp, dobStr] = [g("division"), g("fullName"), g("email"), g("whatsapp"), g("dob")];
  if (!slug || !fullName || !email || !whatsapp || !dobStr) return fail("Please fill in all required fields.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (!/^(\+?254|0)\d{9}$/.test(whatsapp.replace(/\s/g, ""))) return fail("Enter a valid Kenyan WhatsApp number.");
  if (!(photo instanceof Blob) || photo.size === 0 || photo.size > 5_000_000) return fail("Add a photo under 5 MB.");
  if (g("rules") !== "yes") return fail("You must accept the event rules and privacy notice.");

  const dob = new Date(dobStr); if (isNaN(+dob)) return fail("Enter a valid date of birth.");
  const age = ageOn(dob), minor = age < 18;
  if (minor && (!g("guardianName") || !g("guardianPhone") || g("guardianConsent") !== "yes"))
    return fail("A parent or guardian must give their name, phone number and consent for contestants under 18.");

  const db = adminClient();
  const { data: div } = await db.from("divisions").select("id, age_groups(min_age, max_age)").eq("slug", slug).eq("is_active", true).single();
  if (!div) return fail("That category is not available.");
  const ag = (div as any).age_groups;
  if (ag && (age < ag.min_age || age > ag.max_age)) return fail(`This category is for ages ${ag.min_age}–${ag.max_age}.`);

  const path = `${crypto.randomUUID()}.jpg`;
  const up = await db.storage.from("contestant-photos").upload(path, photo, { contentType: "image/jpeg" });
  if (up.error) return fail("Photo upload failed. Please try again.", 500);

  const { data, error } = await db.from("contestants").insert({
    division_id: div.id, full_name: fullName, stage_name: g("stageName") || null, email, whatsapp,
    date_of_birth: dobStr, town: g("town") || null, bio: g("bio") || null, talent: g("talent") || null,
    photo_path: path, is_minor: minor, guardian_name: g("guardianName") || null, guardian_phone: g("guardianPhone") || null,
    guardian_consent: minor ? true : false, consent_at: new Date().toISOString(), status: "submitted",
  }).select("referral_code").single();
  if (error) return fail("Could not save your application. Please try again.", 500);
  return NextResponse.json({ reference: data.referral_code });
}
