import type { SupabaseClient } from "@supabase/supabase-js";
export type Row = { id: string; no: number | null; name: string; votes: number; pct: number; viaLink: number; rank: number };
export type Div = { id: number; category: string; title: string; published: boolean; opens: string | null; closes: string | null; total: number; rows: Row[] };
export type ResultsData = { environment: string; generatedAt: string; divisions: Div[] };

export async function buildResults(db: SupabaseClient, publishedOnly: boolean): Promise<ResultsData> {
  const [{ data: divs }, { data: cs }, { data: sum }, { data: env }] = await Promise.all([
    db.from("divisions").select("id, category, title, voting_opens, voting_closes, results_published").order("id"),
    db.from("contestants").select("id, division_id, contestant_no, full_name, stage_name, is_minor").eq("status", "approved"),
    db.rpc("results_summary"),
    db.from("event_settings").select("value").eq("key", "environment").maybeSingle(),
  ]);
  const votes = new Map((sum ?? []).map((r: any) => [r.contestant_id, r]));
  const divisions: Div[] = (divs ?? []).filter((d: any) => !publishedOnly || d.results_published).map((d: any) => {
    const list = (cs ?? []).filter((c: any) => c.division_id === d.id).map((c: any) => {
      const v: any = votes.get(c.id);
      return { id: c.id, no: c.contestant_no, name: c.is_minor ? c.full_name.split(" ")[0] : c.stage_name || c.full_name, votes: Number(v?.votes ?? 0), viaLink: Number(v?.via_link ?? 0) };
    }).sort((a: any, b: any) => b.votes - a.votes || (a.no ?? 0) - (b.no ?? 0));
    const total = list.reduce((s: number, r: any) => s + r.votes, 0);
    const rows: Row[] = list.map((r: any) => ({ ...r, pct: total ? (r.votes / total) * 100 : 0, rank: 1 + list.filter((x: any) => x.votes > r.votes).length }));
    return { id: d.id, category: d.category, title: d.title, published: d.results_published, opens: d.voting_opens, closes: d.voting_closes, total, rows };
  });
  return { environment: (env?.value as string) ?? "testing", generatedAt: new Date().toISOString(), divisions };
}
