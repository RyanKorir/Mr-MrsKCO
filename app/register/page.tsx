"use client";
import { useState } from "react";
import { compressImage } from "@/lib/image";

const DIVS = [
  ["little-stars-mr", "Mr Little Stars (5–10)"], ["little-stars-miss", "Miss Little Stars (5–10)"],
  ["teen-mr", "Mr Teen (11–17)"], ["teen-miss", "Miss Teen (11–17)"],
  ["kericho-mr", "Mr Kericho (18–26)"], ["kericho-miss", "Miss Kericho (18–26)"],
  ["curvy-miss", "Miss Curvy (18–26)"], ["bodybuilding-mr", "Mr Body Building (18–26)"],
  ["limitless-mr", "Mr Limitless (PWD)"], ["limitless-miss", "Miss Limitless (PWD)"],
];
const input = "w-full border border-gold/40 bg-black/40 px-3 py-2 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function Register() {
  const [dob, setDob] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ref, setRef] = useState("");
  const minor = dob ? (Date.now() - new Date(dob).getTime()) / 31557600000 < 18 : false;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const file = fd.get("photo") as File;
      if (!file || !file.size) throw new Error("Add a photo.");
      fd.set("photo", await compressImage(file), "photo.jpg");
      const r = await fetch("/api/register", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setRef(j.reference);
    } catch (x: any) { setErr(x.message || "Something went wrong. Please try again."); }
    setBusy(false);
  }

  if (ref) return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-gold">Application received</h1>
      <p className="mt-4">Your reference is <b className="text-gold">{ref}</b>. The organisers will review your application and contact you on WhatsApp.</p>
    </main>);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl text-gold">Register as a contestant</h1>
      <p className="mt-2 text-sm text-ivory/75">Registration opens 1 December 2026. Applications are reviewed before any profile is published.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label>Category<select name="division" required className={input}><option value="">Choose a category…</option>{DIVS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label>Full name<input name="fullName" required className={input} /></label>
        <label>Stage name (optional, shown to voters)<input name="stageName" className={input} /></label>
        <label>Email<input name="email" type="email" required className={input} /></label>
        <label>WhatsApp number<input name="whatsapp" inputMode="tel" placeholder="0712 345 678" required className={input} /></label>
        <label>Date of birth (kept private)<input name="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className={input} /></label>
        <label>Town<input name="town" className={input} /></label>
        <label>Short bio<textarea name="bio" rows={3} className={input} /></label>
        <label>Talent or special skills<input name="talent" className={input} /></label>
        <label>Photo (required)<input name="photo" type="file" accept="image/*" required className={input} /></label>
        {minor && (
          <fieldset className="grid gap-4 border border-gold/40 p-4">
            <legend className="px-2 text-gold">Parent or guardian</legend>
            <label>Guardian full name<input name="guardianName" required className={input} /></label>
            <label>Guardian phone<input name="guardianPhone" inputMode="tel" required className={input} /></label>
            <label className="flex gap-2"><input type="checkbox" name="guardianConsent" value="yes" required />
              <span className="text-sm">I am the parent or legal guardian. I consent to my child entering and to their name and photo being published if approved.</span></label>
          </fieldset>)}
        <label className="flex gap-2"><input type="checkbox" name="rules" value="yes" required /><span className="text-sm">I accept the event rules and privacy notice.</span></label>
        {err && <p role="alert" className="text-red-300">{err}</p>}
        <button disabled={busy} className="bg-gold px-7 py-3 font-semibold text-black disabled:opacity-60">{busy ? "Sending…" : "Submit application"}</button>
      </form>
    </main>);
}
