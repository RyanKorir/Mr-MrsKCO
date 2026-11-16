import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/settings";
import { notifyApplication } from "@/lib/email";
import { validateLocation } from "@/lib/kericho";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const ageOn = (dob: Date, ref: Date) => { let a = ref.getFullYear() - dob.getFullYear(); const m = ref.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) a--; return a; };
const normPhone = (p: string) => { const d = p.replace(/[\s-]/g, "").replace(/^\+/, ""); return /^254\d{9}$/.test(d) ? d : /^0\d{9}$/.test(d) ? "254" + d.slice(1) : null; };

export async function POST(req: Request) {
  const st = await getSettings();
  if (!st.open) return fail("Registration has not opened yet.", 403);
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) ?? "").trim();
  const photo = f.get("photo");
  const [slug, gender, fullName, email, dobStr] = [g("division"), g("gender"), g("fullName"), g("email").toLowerCase(), g("dob")];
  const whatsapp = normPhone(g("whatsapp"));
  if (!slug || !gender || !fullName || !email || !dobStr) return fail("Please fill in all required fields.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (!whatsapp) return fail("Enter a valid Kenyan WhatsApp number.");
  if (!(photo instanceof Blob) || photo.size === 0 || photo.size > 5_000_000) return fail("Add a photo under 5 MB.");
  if (g("rules") !== "yes") return fail("You must accept the event rules and privacy notice.");

  const loc = validateLocation(g("constituency"), g("ward"));
  if (!loc) return fail("Choose your constituency and ward.");
  const dob = new Date(dobStr); if (isNaN(+dob)) return fail("Enter a valid date of birth.");
  const age = ageOn(dob, st.ageRef), minor = age < 18;
  if (minor && (!g("guardianName") || !g("guardianPhone") || g("guardianConsent") !== "yes"))
    return fail("A parent or guardian must give their name, phone number and consent for contestants under 18.");

  const db = adminClient();
  const { data: div } = await db.from("divisions").select("id, gender, age_groups(min_age, max_age)").eq("slug", slug).eq("is_active", true).single();
  if (!div) return fail("That category is not available.");
  if (div.gender !== "any" && div.gender !== gender) return fail("This category does not match the gender you selected.");
  const ag = (div as any).age_groups;
  if (ag && (age < ag.min_age || age > ag.max_age)) return fail(`This category is for ages ${ag.min_age}–${ag.max_age} (age counted on ${st.ageRef.toISOString().slice(0, 10)}).`);

  const path = `${crypto.randomUUID()}.jpg`;
  const up = await db.storage.from("contestant-photos").upload(path, photo, { contentType: "image/jpeg" });
  if (up.error) return fail("Photo upload failed. Please try again.", 500);

  const now = new Date().toISOString();
  const { data, error } = await db.from("contestants").insert({
    division_id: div.id, applicant_gender: gender, full_name: fullName, stage_name: g("stageName") || null, email, whatsapp,
    date_of_birth: dobStr, constituency: loc.constituency, ward: loc.ward, bio: g("bio") || null, talent: g("talent") || null, photo_path: path,
    is_minor: minor, guardian_name: g("guardianName") || null, guardian_phone: g("guardianPhone") || null,
    guardian_consent: minor, consent_at: minor ? now : null, rules_accepted_at: now, status: "submitted",
  }).select("referral_code").single();
  if (error) {
    await db.storage.from("contestant-photos").remove([path]); // don't leave an orphan photo
    return fail(error.code === "23505" ? "You have already applied in this category with this email or WhatsApp number." : "Could not save your application. Please try again.", error.code === "23505" ? 409 : 500);
  }
  await notifyApplication({ kind: "contestant", name: fullName, email, reference: data.referral_code, detail: slug });
  return NextResponse.json({ reference: data.referral_code });
}
