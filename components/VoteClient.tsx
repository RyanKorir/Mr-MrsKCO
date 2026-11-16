"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const btn = "border border-gold/60 px-3 py-1.5 text-sm text-gold hover:bg-gold hover:text-black disabled:opacity-40";
type D = { id: number; category: string; title: string; opens: string | null; closes: string | null; state: string; contestants: { id: string; no: number | null; name: string; photo: string | null; code: string }[] };
const when = (s: string | null) => (s ? new Date(s).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "to be announced");

export default function VoteClient({ divisions, turnstileKey }: { divisions: D[]; turnstileKey: string }) {
  const [token, setToken] = useState<string | null>(null), [email, setEmail] = useState(""), [sent, setSent] = useState(false);
  const [voted, setVoted] = useState<number[]>([]), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false), [ts, setTs] = useState("");
  const [ref, setRef] = useState("");
  const tsBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRef(new URLSearchParams(location.search).get("ref") ?? "");
    sb.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setToken(s?.access_token ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (token) fetch("/api/vote", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((j) => setVoted(j.voted ?? [])); }, [token]);
  useEffect(() => {
    if (!turnstileKey || !tsBox.current) return;
    const s = document.createElement("script"); s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; s.async = true;
    s.onload = () => (window as any).turnstile?.render(tsBox.current, { sitekey: turnstileKey, callback: setTs });
    document.head.appendChild(s);
  }, [turnstileKey, token]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + "/vote" } });
    if (error) setMsg("Could not send the sign-in link. Please try again in a minute."); else setSent(true);
  }
  async function vote(d: D, c: D["contestants"][number]) {
    if (!confirm(`Vote for #${c.no} ${c.name} in ${d.title}? You cannot change your vote.`)) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/vote", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ contestantId: c.id, ref: ref || null, turnstile: ts }) });
    const j = await r.json();
    if (r.ok) { setVoted((v) => [...v, d.id]); setMsg(`Thank you! Your vote for ${d.title} was recorded.`); } else setMsg(j.error);
    setBusy(false);
  }
  const cats = [...new Set(divisions.map((d) => d.category))];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">Vote</h1>
      <p className="mt-3 text-ivory/80">Voting is free. You get one vote in each category. Sign in with your email to vote.</p>
      <div className="mt-6 border border-gold/30 p-4">
        {token ? <button className={btn} onClick={() => sb.auth.signOut()}>Sign out</button> : sent ? <p>Check your email for a sign-in link, then come back here.</p> : (
          <form onSubmit={signIn} className="flex flex-wrap gap-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="min-w-0 flex-1 border border-gold/40 bg-black/40 px-3 py-2 text-ivory" />
            <button className="bg-gold px-5 py-2 font-semibold text-black">Email me a sign-in link</button>
          </form>)}
        {turnstileKey && token && <div ref={tsBox} className="mt-3" />}
      </div>
      {msg && <p role="status" className="mt-4 text-gold">{msg}</p>}
      {cats.map((cat) => (
        <section key={cat} className="mt-12">
          <h2 className="font-display text-2xl">{cat}</h2>
          {divisions.filter((d) => d.category === cat).map((d) => (
            <div key={d.id} className="mt-6">
              <h3 className="text-gold">{d.title} <span className="text-sm text-ivory/60">
                {d.state === "open" ? `· voting closes ${when(d.closes)}` : d.state === "soon" ? `· voting opens ${when(d.opens)}` : "· voting closed"}{voted.includes(d.id) ? " · you voted ✓" : ""}</span></h3>
              {d.contestants.length === 0 ? <p className="mt-2 text-sm text-ivory/60">No contestants announced yet.</p> : (
                <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {d.contestants.map((c) => (
                    <li key={c.id} className={`border ${ref && ref === c.code ? "border-gold ring-2 ring-gold" : "border-gold/30"}`}>
                      {c.photo && <img src={c.photo} alt={c.name} loading="lazy" className="aspect-[3/4] w-full object-cover" />}
                      <div className="p-2 text-sm"><p><span className="text-gold">#{c.no}</span> {c.name}</p>
                        <button disabled={busy || !token || d.state !== "open" || voted.includes(d.id)} onClick={() => vote(d, c)} className={`${btn} mt-2 w-full`}>{voted.includes(d.id) ? "Voted" : "Vote"}</button></div>
                    </li>))}
                </ul>)}
            </div>))}
        </section>))}
    </main>);
}
