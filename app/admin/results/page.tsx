"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { ResultsData, Row } from "@/lib/results";
import { drawBar, drawPie } from "@/lib/charts";
import { exportExcel, exportPdf } from "@/lib/export";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const btn = "px-3 py-1.5 text-sm border border-gold/60 text-gold hover:bg-gold hover:text-black disabled:opacity-40";

function Chart({ kind, rows }: { kind: "bar" | "pie"; rows: Row[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) (kind === "bar" ? drawBar : drawPie)(ref.current, rows, true, window.devicePixelRatio || 1); }, [kind, rows]);
  return <canvas ref={ref} role="img" aria-label={`${kind} chart of votes`} className="w-full" />;
}

export default function Results() {
  const [token, setToken] = useState<string | null | undefined>(undefined), [data, setData] = useState<ResultsData | null>(null), [err, setErr] = useState(""), [busy, setBusy] = useState("");
  useEffect(() => { sb.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null)); }, []);
  useEffect(() => { if (token) load(); }, [token]);
  async function load() {
    const r = await fetch("/api/admin/results", { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) return setErr("Your account is not allowed to view results (staff accounts only).");
    setData(await r.json());
  }
  async function publish(id: number, published: boolean) {
    if (published && !confirm(data?.environment !== "live" ? "This is TEST data. Publish anyway?" : "Publish these results to the public?")) return;
    setBusy("p" + id);
    await fetch("/api/admin/results", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ divisionId: id, published }) });
    await load(); setBusy("");
  }
  async function run(kind: "xlsx" | "pdf") { if (!data) return; setBusy(kind); try { await (kind === "xlsx" ? exportExcel : exportPdf)(data); } catch { setErr("Export failed. Please try again."); } setBusy(""); }

  if (token === undefined) return <main className="p-8">Loading…</main>;
  if (!token) return <main className="mx-auto max-w-md px-6 py-24"><meta name="robots" content="noindex" /><p>Please <a className="text-gold underline" href="/admin">sign in on the admin page</a> first, then come back.</p></main>;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <meta name="robots" content="noindex" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-gold">Results</h1>
        <div className="flex flex-wrap gap-2"><a href="/admin" className={btn}>Applications</a><button className={btn} onClick={load}>Refresh</button>
          <button className={btn} disabled={!data || !!busy} onClick={() => run("xlsx")}>{busy === "xlsx" ? "Preparing…" : "Export Excel"}</button>
          <button className={btn} disabled={!data || !!busy} onClick={() => run("pdf")}>{busy === "pdf" ? "Preparing…" : "Export PDF"}</button></div>
      </div>
      {data && data.environment !== "live" && <p role="status" className="mt-4 border border-red-400/60 p-3 text-red-300">TEST DATA: the system is in testing mode. Exports are marked “TEST”.</p>}
      {err && <p role="alert" className="mt-4 text-red-300">{err}</p>}
      {!data && !err && <p className="mt-6 text-ivory/70">Loading…</p>}
      {data?.divisions.map((d) => (
        <section key={d.id} className="mt-8 border border-gold/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">{d.title} <span className="text-sm text-ivory/60">· {d.category} · {d.total} votes</span></h2>
            <button disabled={busy === "p" + d.id} className={btn} onClick={() => publish(d.id, !d.published)}>{d.published ? "Unpublish results" : "Publish results"}</button>
          </div>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-gold"><tr><th className="p-1">Rank</th><th>No.</th><th>Contestant</th><th>Votes</th><th>Share</th><th>Via own link</th></tr></thead>
            <tbody>{d.rows.map((r) => <tr key={r.id} className="border-t border-gold/20"><td className="p-1">{r.rank}</td><td>{r.no ? "#" + r.no : ""}</td><td>{r.name}</td><td>{r.votes}</td><td>{r.pct.toFixed(1)}%</td><td>{r.viaLink}</td></tr>)}</tbody></table></div>
          {d.rows.length === 0 ? <p className="mt-3 text-sm text-ivory/60">No approved contestants yet.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2"><Chart kind="bar" rows={d.rows} /><Chart kind="pie" rows={d.rows} /></div>}
        </section>))}
    </main>);
}
