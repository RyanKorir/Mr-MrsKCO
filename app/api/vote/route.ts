import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase-server";

const DISPOSABLE = ["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com", "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com", "maildrop.cc", "throwawaymail.com"];
const MSG: Record<string, string> = {
  already_voted: "You have already voted in this category.", voting_closed: "Voting is not open for this category right now.",
  contestant_not_eligible: "This contestant is not available for voting.", email_not_verified: "Please verify your email first.", sign_in_required: "Please sign in to vote.",
};
async function who(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await adminClient().auth.getUser(token);
  return data?.user ?? null;
}

export async function GET(req: Request) {
  const u = await who(req); if (!u) return NextResponse.json({ voted: [] });
  const { data } = await adminClient().rpc("my_votes_as", { p_voter: u.id });
  return NextResponse.json({ voted: data ?? [] });
}

export async function POST(req: Request) {
  const u = await who(req);
  if (!u) return NextResponse.json({ error: MSG.sign_in_required }, { status: 401 });
  const domain = (u.email ?? "").split("@")[1]?.toLowerCase();
  if (!domain || DISPOSABLE.includes(domain)) return NextResponse.json({ error: "Please use a permanent email address to vote." }, { status: 400 });
  const { contestantId, ref, turnstile } = await req.json().catch(() => ({}));
  if (typeof contestantId !== "string") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const secret = process.env.TURNSTILE_SECRET_KEY; // bot check switches on once this key is set
  if (secret) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: String(turnstile ?? ""), ...(ip ? { remoteip: ip } : {}) }) });
    if (!(await r.json()).success) return NextResponse.json({ error: "Bot check failed. Please try again." }, { status: 400 });
  }
  const { error } = await adminClient().rpc("cast_vote_as", { p_voter: u.id, p_contestant: contestantId, p_ref: typeof ref === "string" ? ref : null });
  if (error) {
    const key = Object.keys(MSG).find((k) => error.message.includes(k));
    return NextResponse.json({ error: key ? MSG[key] : "Could not record your vote. Please try again." }, { status: key ? 400 : 500 });
  }
  return NextResponse.json({ ok: true });
}
