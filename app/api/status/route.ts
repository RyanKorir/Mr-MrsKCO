import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { adminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const s = await getSettings();
    const { count } = await adminClient().from("divisions").select("id", { count: "exact", head: true }).eq("results_published", true).lt("voting_closes", new Date().toISOString());
    return NextResponse.json({ open: s.open, opens: s.opens, resultsOut: (count ?? 0) > 0 }); }
  catch { return NextResponse.json({ open: true }); } // the register route still enforces the real rule
}
