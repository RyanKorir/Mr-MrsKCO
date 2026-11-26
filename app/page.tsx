import Countdown from "@/components/Countdown";
import { EVENT, DIVISIONS } from "@/lib/event";
import { adminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
export default async function Home() {
  let resultsOut = false;
  try { const { count } = await adminClient().from("divisions").select("id", { count: "exact", head: true }).eq("results_published", true); resultsOut = (count ?? 0) > 0; } catch {}
  return (
    <main>
      {resultsOut && <a href="/results" className="block bg-gold px-4 py-2 text-center text-sm font-semibold text-black">Results are in. See the winners</a>}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center gap-8 px-6 py-20 text-center"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #0f6b49 0%, #0a3d2b 38%, #050b08 78%)" }}>
        <div className="flex items-center gap-3"><img src="/dwell-logo.jpg" alt="Dwell Events Limited" className="h-14 w-14 rounded-full bg-white object-cover" /><p className="text-sm text-ivory/80">Dwell Events presents</p></div>
        <h1 className="font-display text-5xl leading-tight text-gold sm:text-7xl">Mr &amp; Miss<br />Kericho 2027</h1>
        <p className="max-w-xl text-ivory/85">Celebrating beauty, talent and cultural heritage.</p>
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-ivory/80">Registration opens 1 December 2026</p>
          <Countdown to={EVENT.registrationOpens} />
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/register" className="bg-gold px-7 py-3 font-semibold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory">Register as a contestant</a>
          <a href="/vote" className="border border-gold px-7 py-3 text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory">Voting opens soon</a>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-6 pt-20">
        <h2 className="font-display text-3xl text-gold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[["Register", "Choose your category and send your application."], ["Get approved", "The organisers review it and give you a contestant number."], ["Share and vote", "Invite people to vote for you. Voting is free."]].map(([t, d], i) => (
            <li key={t} className="border border-gold/30 p-4"><span className="font-display text-2xl text-gold">{i + 1}</span><p className="mt-2 font-display text-lg">{t}</p><p className="mt-1 text-sm text-ivory/80">{d}</p></li>))}
        </ol>
        <p className="mt-4"><a href="/how-it-works" className="text-gold underline underline-offset-4">See the full guide and answers to common questions</a></p>
      </section>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl text-gold">Competition categories</h2>
        <ul className="mt-8 divide-y divide-gold/25">
          {DIVISIONS.map((d) => (
            <li key={d.category} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
              <span className="font-display text-xl">{d.category}</span>
              <span className="text-sm text-ivory/75">{d.titles.join(" and ")} · ages {d.ages}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10"><a href="/fashion-week" className="text-gold underline underline-offset-4">Kericho Fashion Week 2027: designers and fashionistas, apply here</a></p>
        <p className="mt-6 text-sm text-ivory/70">Questions? Call {EVENT.phones.join(" or ")}.</p>
      </section>
    </main>
  );
}
