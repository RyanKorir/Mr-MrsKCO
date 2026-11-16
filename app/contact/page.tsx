import { EVENT } from "@/lib/event";
export const metadata = { title: "Contact – Mr & Miss Kericho 2027" };
export default function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">Contact us</h1>
      <p className="mt-4 text-ivory/80">Questions about registration, categories or Kericho Fashion Week? Reach the organisers directly.</p>
      <dl className="mt-10 grid gap-6">
        <div><dt className="text-gold">Email</dt><dd><a className="underline underline-offset-4" href="mailto:mrandmisskericho@gmail.com">mrandmisskericho@gmail.com</a></dd></div>
        <div><dt className="text-gold">Phone / WhatsApp</dt>{EVENT.phones.map((p) => <dd key={p}><a className="underline underline-offset-4" href={`tel:${p}`}>{p}</a></dd>)}</div>
        <div><dt className="text-gold">Social media</dt><dd>@mrandmisskericho on all platforms</dd></div>
        <div><dt className="text-gold">Organiser</dt><dd>Dwell Events Limited</dd></div>
      </dl>
    </main>);
}
