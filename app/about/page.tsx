export const metadata = { title: "About – Mr & Miss Kericho 2027" };
export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-gold">About Mr &amp; Miss Kericho</h1>
      <p className="mt-8 text-lg leading-relaxed">Mr &amp; Miss Kericho is an inclusive fashion, beauty and talent platform that celebrates diversity, confidence and self-expression. Our event brings together models across every category, including Kids, Teens, Plus Size, Persons with Disabilities (PWDs) and Senior Models, giving everyone the chance to showcase their unique beauty, talent and style.</p>
      <p className="mt-6 text-lg leading-relaxed">The event features an exciting fashion showcase that builds up to a spectacular Grand Finale celebrating creativity, elegance and individuality. Beyond the runway, we aim to promote inclusivity, nurture talent and showcase the rich cultural heritage of Kericho County.</p>
      <p className="mt-6 text-gold">Celebrating beauty, talent and cultural heritage.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a href="/register" className="bg-gold px-7 py-3 font-semibold text-black">Register as a contestant</a>
        <a href="/contestants" className="border border-gold px-7 py-3 text-gold">Meet the contestants</a>
      </div>
    </main>);
}
