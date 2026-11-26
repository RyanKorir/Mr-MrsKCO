"use client";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/event";
import { SPONSORS } from "@/lib/sponsors";
export default function Footer() {
  if (usePathname().startsWith("/admin")) return null;
  return (
    <footer className="mt-16 border-t border-gold/25 px-6 py-10 text-sm text-ivory/75">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-6">
        <div className="flex items-center gap-3"><img src="/dwell-logo.jpg" alt="" className="h-12 w-12 rounded-full bg-white object-cover" /><p>Presented by Dwell Events Limited</p></div>
        <div><p className="text-gold">Contact</p><p>mrandmisskericho@gmail.com</p><p>{EVENT.phones.join(" / ")}</p><p>@mrandmisskericho</p></div>
        <div><p className="text-gold">Explore</p><p><a href="/about">About</a> · <a href="/how-it-works">How it works</a> · <a href="/contestants">Contestants</a> · <a href="/register">Register</a></p></div>
      </div>
      {SPONSORS.length > 0 && (
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 border-t border-gold/15 pt-6">
          <span className="text-xs text-ivory/50">Supported by</span>
          {SPONSORS.map((x) => {
            const img = <img src={x.logo} alt={x.name} loading="lazy" className="h-7 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />;
            return x.url ? <a key={x.name} href={x.url} target="_blank" rel="noopener noreferrer sponsored" aria-label={x.name}>{img}</a> : <span key={x.name}>{img}</span>;
          })}
        </div>)}
      <p className="mx-auto mt-8 max-w-5xl text-xs text-ivory/50">© 2027 Mr &amp; Miss Kericho. All rights reserved.</p>
    </footer>);
}
