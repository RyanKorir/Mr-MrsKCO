"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const input = "w-full border border-gold/40 bg-black/40 px-3 py-2 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
const btn = "px-3 py-1.5 text-sm border border-gold/60 text-gold hover:bg-gold hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory";
type C = any;

export default function Admin() {
  const [token, setToken] = useState<string | null>(null), [err, setErr] = useState(""), [data, setData] = useState<{ contestants: C[]; fashionWeek: C[] } | null>(null);
  const [tab, setTab] = useState<"contestants" | "fashion">("contestants"), [filter, setFilter] = useState("submitted"), [busy, setBusy] = useState("");

  useEffect(() => { sb.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null)); }, []);
  useEffect(() => { if (token) load(); }, [token]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const fd = new FormData(e.currentTarget);
    const { data, error } = await sb.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
    if (error) return setErr("Wrong email or password.");
    setToken(data.session.access_token);
  }
  async function load() {
    const r = await fetch("/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) { setErr("This account is not authorised for the admin area."); await sb.auth.signOut(); setToken(null); return; }
    setData(await r.json());
  }
  async function review(id: string, action: string, table = "contestants") {
    setBusy(id); setErr("");
    const r = await fetch("/api/admin/review", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id, action, table }) });
    const j = await r.json(); if (!r.ok) setErr(j.error); else await load();
    setBusy("");
  }
  const list = useMemo(() => (tab === "contestants" ? data?.contestants : data?.fashionWeek)?.filter((x: C) => filter === "all" || x.status === filter) ?? [], [data, tab, filter]);
  const count = (s: string) => (tab === "contestants" ? data?.contestants : data?.fashionWeek)?.filter((x: C) => x.status === s).length ?? 0;

  if (!token) return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <meta name="robots" content="noindex" />
      <h1 className="font-display text-2xl text-gold">Staff sign in</h1>
      <form onSubmit={login} className="mt-6 grid gap-4">
        <label>Email<input name="email" type="email" required autoComplete="username" className={input} /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
        {err && <p role="alert" className="text-red-300">{err}</p>}
        <button className="bg-gold px-5 py-2 font-semibold text-black">Sign in</button>
      </form>
    </main>);

  const wa = (c: C) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Congratulations ${c.stage_name || c.full_name.split(" ")[0]}! Your application for ${c.divisions?.title} in Mr & Miss Kericho 2027 has been approved. Your contestant number is ${c.contestant_no}. The organisers will share the next steps soon.`)}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <meta name="robots" content="noindex" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-gold">Applications</h1>
        <button className={btn} onClick={async () => { await sb.auth.signOut(); setToken(null); setData(null); }}>Sign out</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["contestants", "fashion"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`${btn} ${tab === t ? "bg-gold !text-black" : ""}`}>{t === "contestants" ? "Contestants" : "Fashion Week"}</button>)}
        <span className="mx-2 border-l border-gold/30" />
        {["submitted", "under_review", "approved", "rejected", "all"].map((s) => <button key={s} onClick={() => setFilter(s)} className={`${btn} ${filter === s ? "bg-gold !text-black" : ""}`}>{s.replace("_", " ")}{s !== "all" ? ` (${count(s)})` : ""}</button>)}
      </div>
      {err && <p role="alert" className="mt-4 text-red-300">{err}</p>}
      {!data && <p className="mt-8 text-ivory/70">Loading…</p>}
      <ul className="mt-6 grid gap-4">
        {list.map((c: C) => (
          <li key={c.id} className="grid gap-4 border border-gold/30 p-4 sm:grid-cols-[120px_1fr]">
            {tab === "contestants" && (c.photo ? <img src={c.photo} alt="" className="h-40 w-full object-cover sm:w-[120px]" /> : <div className="h-40 bg-black/40" />)}
            <div className={tab === "contestants" ? "" : "sm:col-span-2"}>
              <p className="font-display text-lg">{c.full_name}{c.stage_name ? ` (“${c.stage_name}”)` : ""} {c.contestant_no ? <span className="text-gold">#{c.contestant_no}</span> : null} {c.is_test && <span className="ml-2 border border-ivory/40 px-1 text-xs">TEST</span>}</p>
              <p className="text-sm text-ivory/75">{tab === "contestants" ? `${c.divisions?.title} · born ${c.date_of_birth} · ${c.constituency ?? c.town ?? "no area"}${c.ward ? ", " + c.ward : ""}${c.is_minor ? " · UNDER 18" : ""}` : `${c.kind} · ${c.constituency ?? c.location ?? "no area"}${c.ward ? ", " + c.ward : ""}`}</p>
              <p className="mt-1 text-sm">{c.email} · {c.whatsapp ?? c.phone}</p>
              {c.is_minor && <p className="mt-1 text-sm text-gold">Guardian: {c.guardian_name}, {c.guardian_phone} · consent {c.guardian_consent ? "given" : "MISSING"}</p>}
              {(c.bio || c.talent) && <p className="mt-2 text-sm text-ivory/85">{c.bio} {c.talent}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="border border-ivory/30 px-2 py-1 text-xs">{c.status.replace("_", " ")}</span>
                <button disabled={busy === c.id} className={btn} onClick={() => review(c.id, "approve", tab === "fashion" ? "fashion_week" : "contestants")}>Approve</button>
                <button disabled={busy === c.id} className={btn} onClick={() => review(c.id, "review", tab === "fashion" ? "fashion_week" : "contestants")}>Under review</button>
                <button disabled={busy === c.id} className={btn} onClick={() => confirm("Reject this application?") && review(c.id, "reject", tab === "fashion" ? "fashion_week" : "contestants")}>Reject</button>
                {tab === "contestants" && c.status === "approved" && <a className={btn} href={wa(c)} target="_blank" rel="noopener noreferrer">Send approval on WhatsApp</a>}
              </div>
            </div>
          </li>))}
        {data && list.length === 0 && <p className="text-ivory/70">Nothing here.</p>}
      </ul>
    </main>);
}
