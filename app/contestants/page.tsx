import { adminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contestants – Mr & Miss Kericho 2027" };

export default async function Contestants() {
  const db = adminClient();
  const [{ data: divs }, { data: cs }] = await Promise.all([
    db.from("divisions").select("id, category, title").eq("is_active", true).order("id"),
    db.from("public_contestants").select("id, division_id, contestant_no, display_name, photo_path").order("contestant_no"),
  ]);
  const { data: signed } = await db.storage.from("contestant-photos").createSignedUrls((cs ?? []).map((c) => c.photo_path), 3600);
  const photo = Object.fromEntries((signed ?? []).map((s) => [s.path, s.signedUrl]));
  const cats = [...new Set((divs ?? []).map((d) => d.category))];
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">Meet the contestants</h1>
      <p className="mt-3 text-ivory/80">Approved contestants appear here under their category. Voting opens soon.</p>
      {cats.map((cat) => (
        <section key={cat} className="mt-14">
          <h2 className="font-display text-2xl">{cat}</h2>
          {(divs ?? []).filter((d) => d.category === cat).map((d) => {
            const list = (cs ?? []).filter((c) => c.division_id === d.id);
            return (
              <div key={d.id} className="mt-6">
                <h3 className="text-gold">{d.title}</h3>
                {list.length === 0 ? <p className="mt-2 text-sm text-ivory/60">No contestants announced yet.</p> : (
                  <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {list.map((c) => (
                      <li key={c.id} className="border border-gold/30">
                        {photo[c.photo_path] && <img src={photo[c.photo_path]} alt={c.display_name} loading="lazy" className="aspect-[3/4] w-full object-cover" />}
                        <p className="p-2 text-sm"><span className="text-gold">#{c.contestant_no}</span> {c.display_name}</p>
                      </li>))}
                  </ul>)}
              </div>);
          })}
        </section>))}
    </main>);
}
