"use client";
import { useState } from "react";
import { KERICHO, OUTSIDE } from "@/lib/kericho";
const input = "w-full border border-gold/40 bg-black/40 px-3 py-2 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
export default function LocationFields() {
  const [c, setC] = useState("");
  return (
    <>
      <label>Constituency
        <select name="constituency" required value={c} onChange={(e) => setC(e.target.value)} className={input}>
          <option value="">Choose a constituency…</option>
          {Object.keys(KERICHO).map((k) => <option key={k} value={k}>{k}</option>)}
          <option value={OUTSIDE}>{OUTSIDE}</option>
        </select></label>
      {c === OUTSIDE ? (
        <label>Your county and town<input name="ward" required maxLength={80} placeholder="e.g. Bomet, Sotik" className={input} /></label>
      ) : (
        <label>Ward
          <select name="ward" required disabled={!c} className={input}>
            <option value="">{c ? "Choose a ward…" : "Choose a constituency first"}</option>
            {(KERICHO[c] ?? []).map((w) => <option key={w} value={w}>{w}</option>)}
          </select></label>
      )}
    </>);
}
