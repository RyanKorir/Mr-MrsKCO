import { adminClient } from "@/lib/supabase-server";
import VoteClient from "@/components/VoteClient";
export const dynamic = "force-dynamic";
export const metadata = { title: "Vote – Mr & Miss Kericho 2027" };

export default async function Vote() {
  const db = adminClient();
  const [{ data: divs }, { data: cs }] = await Promise.all([
    db.from("divisions").select("id, category, title, voting_opens, voting_closes, results_published").eq("is_active", true).order("id"),
    db.from("public_contestants").select("id, division_id, contestant_no, display_name, photo_path, referral_code").order("contestant_no"),
  ]);
  const { data: signed } = await db.storage.from("contestant-photos").createSignedUrls((cs ?? []).map((c) => c.photo_path), 3600);
  const photo = Object.fromEntries((signed ?? []).map((s) => [s.path, s.signedUrl]));
  const now = Date.now();
  const divisions = (divs ?? []).map((d) => ({
    id: d.id, published: d.results_published, category: d.category, title: d.title, opens: d.voting_opens, closes: d.voting_closes,
    state: !d.voting_opens || now < +new Date(d.voting_opens) ? "soon" : now > +new Date(d.voting_closes!) ? "closed" : "open",
    contestants: (cs ?? []).filter((c) => c.division_id === d.id).map((c) => ({ id: c.id, no: c.contestant_no, name: c.display_name, photo: photo[c.photo_path] ?? null, code: c.referral_code })),
  }));
  return <VoteClient divisions={divisions} turnstileKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />;
}
