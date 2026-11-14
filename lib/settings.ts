import { adminClient } from "./supabase-server";
export async function getSettings() {
  const { data } = await adminClient().from("event_settings").select("key, value");
  const m = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
  const opens: string = m.registration_opens ?? "2026-12-01T00:00:00+03:00";
  const forced = m.registration_force_open === true;
  return { opens, open: forced || Date.now() >= new Date(opens).getTime(), ageRef: new Date((m.age_reference_date ?? "2027-03-01") + "T00:00:00+03:00") };
}
