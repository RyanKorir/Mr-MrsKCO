"use client";
import { useEffect, useState } from "react";
export default function Countdown({ to }: { to: string }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => { const t = () => setMs(Math.max(0, new Date(to).getTime() - Date.now())); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [to]);
  const p = (n: number) => String(n).padStart(2, "0");
  const s = (ms ?? 0) / 1000;
  const cells = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor(s / 3600) % 24], ["Minutes", Math.floor(s / 60) % 60], ["Seconds", Math.floor(s) % 60]] as const;
  return (
    <div className="flex gap-3 sm:gap-5" aria-live="off">
      {cells.map(([label, v]) => (
        <div key={label} className="min-w-[4.25rem] border border-gold/50 px-3 py-2 text-center">
          <div className="font-display text-3xl text-gold">{ms === null ? "--" : p(v)}</div>
          <div className="text-xs text-ivory/70">{label}</div>
        </div>
      ))}
    </div>
  );
}
