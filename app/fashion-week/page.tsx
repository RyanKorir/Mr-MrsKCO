"use client";
import { useState } from "react";
import { compressImage } from "@/lib/image";
import LocationFields from "@/components/LocationFields";
const input = "w-full border border-gold/40 bg-black/40 px-3 py-2 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function FashionWeek() {
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const file = fd.get("photo") as File;
      if (file && file.size) fd.set("photo", await compressImage(file), "photo.jpg"); else fd.delete("photo");
      const r = await fetch("/api/fashion-week", { method: "POST", body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      setDone(true);
    } catch (x: any) { setErr(x.message || "Something went wrong. Please try again."); }
    setBusy(false);
  }
  if (done) return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-gold">Thank you</h1>
      <p className="mt-4">Your Kericho Fashion Week 2027 application was received. The organisers will contact you.</p>
    </main>);
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl text-gold">Kericho Fashion Week 2027</h1>
      <p className="mt-2 text-ivory/80">A fusion of culture and elegance. Fashion designers and fashionistas, apply to take part.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label>I am a<select name="kind" required className={input}><option value="">Choose…</option><option value="designer">Fashion designer</option><option value="fashionista">Fashionista</option></select></label>
        <label>Full name or brand name<input name="fullName" required className={input} /></label>
        <label>Email<input name="email" type="email" required className={input} /></label>
        <label>Phone / WhatsApp<input name="phone" inputMode="tel" placeholder="0712 345 678" required className={input} /></label>
        <LocationFields />
        <label>About you or your collection<textarea name="bio" rows={4} className={input} /></label>
        <label>Instagram, TikTok or website links (one per line)<textarea name="links" rows={2} className={input} /></label>
        <label>Photo or look (optional)<input name="photo" type="file" accept="image/*" className={input} /></label>
        <label className="flex gap-2"><input type="checkbox" name="rules" value="yes" required /><span className="text-sm">I accept the event rules and privacy notice.</span></label>
        {err && <p role="alert" className="text-red-300">{err}</p>}
        <button disabled={busy} className="bg-gold px-7 py-3 font-semibold text-black disabled:opacity-60">{busy ? "Sending…" : "Submit application"}</button>
      </form>
    </main>);
}
