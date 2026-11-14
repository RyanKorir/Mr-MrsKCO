import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
export async function GET() {
  try { const s = await getSettings(); return NextResponse.json({ open: s.open, opens: s.opens }); }
  catch { return NextResponse.json({ open: true }); } // the register route still enforces the real rule
}
