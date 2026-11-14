import { adminClient } from "./supabase-server";
// Verifies the caller's Supabase session token and that they hold a staff role. Runs on the server only.
export async function requireStaff(req: Request, allowed: string[] = ["super_admin", "event_manager"]) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const db = adminClient();
  const { data: u } = await db.auth.getUser(token);
  if (!u?.user) return null;
  const { data: p } = await db.from("profiles").select("role").eq("id", u.user.id).single();
  if (!p?.role || !allowed.includes(p.role)) return null;
  return { id: u.user.id, role: p.role as string, db };
}
