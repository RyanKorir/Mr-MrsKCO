"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
const links = [["/", "Home"], ["/about", "About"], ["/contestants", "Contestants"], ["/vote", "Vote"], ["/fashion-week", "Fashion Week"], ["/contact", "Contact"]];
export default function SiteNav() {
  const path = usePathname(), [open, setOpen] = useState(false);
  if (path.startsWith("/admin")) return null;
  return (
    <header className="sticky top-0 z-20 border-b border-gold/25 bg-[#050b08]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3" aria-label="Main">
        <a href="/" className="font-display text-gold">Mr &amp; Miss Kericho</a>
        <button className="border border-gold/50 px-3 py-1 text-sm text-gold sm:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
        <ul className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-gold/25 bg-[#050b08] p-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:p-0`}>
          {links.map(([h, l]) => <li key={h}><a href={h} aria-current={path === h ? "page" : undefined} className={`text-sm ${path === h ? "text-gold" : "text-ivory/80"} hover:text-gold`}>{l}</a></li>)}
          <li><a href="/register" className="bg-gold px-4 py-2 text-sm font-semibold text-black">Register</a></li>
        </ul>
      </nav>
    </header>);
}
