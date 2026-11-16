import { adminClient } from "@/lib/supabase-server";
import { buildResults } from "@/lib/results";
export const dynamic = "force-dynamic";
export const metadata = { title: "Results – Mr & Miss Kericho 2027" };

export default async function PublicResults() {
  const data = await buildResults(adminClient(), true);
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">Results</h1>
      {data.environment !== "live" && <p className="mt-4 border border-red-400/60 p-3 text-red-300">TEST DATA: this site is in testing mode.</p>}
      {data.divisions.length === 0 && <p className="mt-6 text-ivory/80">Results will be published here once voting closes.</p>}
      {data.divisions.map((d) => (
        <section key={d.id} className="mt-12">
          <h2 className="font-display text-2xl">{d.title} <span className="text-sm text-ivory/60">· {d.category}</span></h2>
          <ol className="mt-4 grid gap-3">
            {d.rows.map((r) => (
              <li key={r.id}>
                <div className="flex justify-between text-sm"><span><span className="text-gold">{r.rank}.</span> {r.no ? `#${r.no} ` : ""}{r.name}</span><span>{r.votes} votes · {r.pct.toFixed(1)}%</span></div>
                <div className="mt-1 h-3 bg-white/10"><div className="h-3 bg-gold" style={{ width: `${r.pct}%` }} /></div>
              </li>))}
          </ol>
        </section>))}
    </main>);
}
