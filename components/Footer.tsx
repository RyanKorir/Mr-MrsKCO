"use client";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/event";
export default function Footer() {
  if (usePathname().startsWith("/admin")) return null;
  return (
    <footer className="mt-16 border-t border-gold/25 px-6 py-10 text-sm text-ivory/75">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-6">
        <div className="flex items-center gap-3"><img src="/dwell-logo.jpg" alt="" className="h-12 w-12 rounded-full bg-white object-cover" /><p>Presented by Dwell Events Limited</p></div>
        <div><p className="text-gold">Contact</p><p>mrandmisskericho@gmail.com</p><p>{EVENT.phones.join(" / ")}</p><p>@mrandmisskericho</p></div>
        <div><p className="text-gold">Explore</p><p><a href="/about">About</a> · <a href="/how-it-works">How it works</a> · <a href="/contestants">Contestants</a> · <a href="/results">Results</a> · <a href="/register">Register</a></p></div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-xs text-ivory/50">© 2027 Mr &amp; Miss Kericho. All rights reserved.</p>
    </footer>);
}
